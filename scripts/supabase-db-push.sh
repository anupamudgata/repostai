#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Set SUPABASE_DB_PASSWORD to your Supabase database password."
  echo "Dashboard → Project Settings → Database → Database password"
  echo ""
  echo "Then: export SUPABASE_DB_PASSWORD='...' && npm run db:push:remote"
  exit 1
fi

exec npx supabase db push --linked "$@"
