#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Load from .env.local when not already exported (npm does not load dotenv for this script)
if [[ -z "${SUPABASE_DB_PASSWORD:-}" && -f .env.local ]]; then
  _pwd="$(node scripts/read-supabase-db-password.mjs 2>/dev/null)" || true
  if [[ -n "${_pwd}" ]]; then
    export SUPABASE_DB_PASSWORD="${_pwd}"
  fi
  unset _pwd
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Add SUPABASE_DB_PASSWORD to .env.local (Database password from Supabase Dashboard), or export it in your shell."
  echo "Dashboard → Project Settings → Database → Database password"
  echo ""
  echo "Example: export SUPABASE_DB_PASSWORD=... && npm run db:push:remote"
  exit 1
fi

# --include-all: remote history may omit short-dated versions; applies any pending local files
# supabase@latest: project config uses Postgres 17; older global CLI rejects major_version 17
exec npx supabase@latest db push --linked --include-all "$@"
