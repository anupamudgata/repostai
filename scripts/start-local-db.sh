#!/bin/bash
# Start local Supabase (Postgres + Auth + Studio)
# Requires: Docker Desktop running
# After start: copy .env.local from output, run migrations

set -e
cd "$(dirname "$0")/.."

echo "Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop first."
  echo "   https://docs.docker.com/desktop/"
  exit 1
fi

echo "Starting Supabase local..."
npx supabase start

echo ""
echo "✅ Local Supabase is running!"
echo ""
echo "Copy these to .env.local (replace existing Supabase vars):"
npx supabase status 2>/dev/null | grep -E "API URL|anon key|service_role" || true
echo ""
echo "Then run migrations in Supabase Studio: http://localhost:54323"
echo "Or: npx supabase db reset"
