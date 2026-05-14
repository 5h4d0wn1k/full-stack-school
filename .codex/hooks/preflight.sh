#!/usr/bin/env bash
set -euo pipefail

echo "== full-stack-school preflight =="
git status --short --branch

if [ -f verification_contract.json ]; then
  echo "verification_contract.json present"
else
  echo "verification_contract.json missing" >&2
  exit 1
fi

if [ -f package.json ]; then
  npm run audit:critical
  npm run verify
fi
