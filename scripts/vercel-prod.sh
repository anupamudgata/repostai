#!/usr/bin/env bash
set -euo pipefail
# Stale or wrong VERCEL_TOKEN in the environment triggers:
# "The specified token is not valid. Use vercel login to generate a new token."
# Local deploys should use `vercel login` once; CI can pass a fresh token explicitly.
unset VERCEL_TOKEN 2>/dev/null || true
# --yes skips prompts; pass --scope team-slug if the CLI asks for a default team
exec vercel --prod --yes "$@"
