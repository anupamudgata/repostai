# Profile Setup Issue — Diagnosis & Fix Guide

## Problem
Free users (and any new users) see: **"Your account profile isn't ready yet. Refresh the page or sign out and sign in again."**

## Root Cause
When a new user signs up, the system needs to automatically create a `profiles` row in your Supabase database. Without this:
- The `repurpose_jobs` table can't insert a row (foreign key constraint fails)
- The user sees the "profile isn't ready" error

Two safety mechanisms prevent this:
1. **Auto-trigger on signup** (`handle_new_user` trigger) — fires when auth user is created
2. **Fallback RPC** (`ensure_profile_from_auth`) — called manually when a repurpose request comes in

If BOTH fail, users hit the error.

---

## Diagnosis Checklist

### Step 1: Check if Migrations Are Deployed

Run these queries in your Supabase SQL Editor to check:

```sql
-- Check if the RPC exists
SELECT * FROM information_schema.routines
WHERE routine_name = 'ensure_profile_from_auth'
AND routine_schema = 'public';
-- Expected: 1 row (should exist)

-- Check if the trigger exists
SELECT trigger_name, event_object_table, trigger_definition
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
AND trigger_schema = 'public';
-- Expected: 1 row (should exist)
```

### Step 2: Verify Trigger Execution

Test the trigger manually:

```sql
-- Create a test auth user (if you have admin access)
-- Then check if a profiles row was auto-created
SELECT id, email FROM public.profiles WHERE email = 'test@example.com';
-- Expected: The row should exist (created by trigger)
```

### Step 3: Test the RPC Fallback

If the trigger fails, the RPC should catch it. Run this in the JS console as an authenticated user:

```javascript
// From your app's client-side code
const { error } = await supabase.rpc('ensure_profile_from_auth');
if (error) {
  console.error('RPC failed:', error);
} else {
  console.log('Profile created/verified via RPC');
}
```

---

## Solutions

### ✅ Solution A: Deploy Migrations (Recommended)

If the migrations are missing from your Supabase:

1. **In Supabase Console:**
   - Go to **SQL Editor**
   - Click **"New query"**
   - Copy the contents of these files and run them IN ORDER:
     - `supabase/migrations/20260327180000_ensure_profile_from_auth_rpc.sql`
     - `supabase/migrations/20260329140000_handle_new_user_trigger.sql`

2. **Verify deployment:**
   ```sql
   SELECT * FROM information_schema.routines
   WHERE routine_name = 'ensure_profile_from_auth';
   ```
   Should return 1 row.

### ✅ Solution B: If Migrations Are Deployed But Still Failing

**Possible causes:**
- RPC has no execute permission for authenticated users
- Trigger is disabled or not firing
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) is not set

**Check permissions:**
```sql
-- Verify RPC permissions
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'ensure_profile_from_auth';
-- Should show: authenticated → EXECUTE, service_role → EXECUTE
```

**Check if trigger is enabled:**
```sql
SELECT tgenabled FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
-- Should return: 't' (true)
```

### ✅ Solution C: Manual Profile Creation (Workaround)

If you need to fix existing users:

```sql
-- Create missing profiles for users who signed up before the fix
INSERT INTO public.profiles (id, email, name, avatar_url, market_region)
SELECT
  u.id,
  COALESCE(NULLIF(TRIM(u.email), ''), REPLACE(u.id::text, '-', '') || '@users.repostai.local'),
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'market_region'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL  -- Only create for users without profiles
ON CONFLICT (id) DO NOTHING;
```

---

## Quick Fix Checklist

- [ ] Verify migrations exist in Supabase SQL Editor
- [ ] Check RPC permissions are set correctly
- [ ] Confirm trigger is enabled
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` in your `.env` (if not already)
- [ ] Test with a new user signup to confirm auto-profile creation
- [ ] Run manual fix SQL if needed for existing users

---

## What Should Happen After Fix

1. **New user signs up** → `on_auth_user_created` trigger fires → `profiles` row created automatically
2. **User tries to repurpose** → `ensureProfileForUser()` checks profile exists
3. **Success!** → No more "profile isn't ready" error

---

## For Developer: Environment Setup

Make sure these env vars are set in your deployment:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # CRITICAL for fallback
```

Without `SUPABASE_SERVICE_ROLE_KEY`, the fallback profile creation fails and users hit the error.
