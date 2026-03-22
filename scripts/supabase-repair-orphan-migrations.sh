#!/usr/bin/env bash
# Remote DB sometimes has legacy version names "20250317" / "20250318" with no matching
# local file (locals use 20250317120000_*.sql etc.). That breaks `db push` with:
#   Remote migration versions not found in local migrations directory.
# This marks those history rows reverted so --include-all can apply the real files.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${SUPABASE_DB_PASSWORD:-}" && -f .env.local ]]; then
  _pwd="$(node scripts/read-supabase-db-password.mjs 2>/dev/null)" || true
  if [[ -n "${_pwd}" ]]; then
    export SUPABASE_DB_PASSWORD="${_pwd}"
  fi
  unset _pwd
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Set SUPABASE_DB_PASSWORD or add it to .env.local"
  exit 1
fi

echo "Repairing orphan migration names on remote (20250317, 20250318)..."
npx supabase migration repair --status reverted 20250317 --linked
npx supabase migration repair --status reverted 20250318 --linked
echo "Done. Run: npm run db:push:remote"
