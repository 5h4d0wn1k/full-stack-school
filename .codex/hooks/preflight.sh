#!/usr/bin/env bash
set -euo pipefail

echo "== full-stack-school preflight =="
git status --short --branch

if [ -n "$(git status --porcelain=v1)" ]; then
  echo "dirty worktree detected; quarantine status, branch/upstream details, and git diff --binary under .codex/evidence/ before unrelated growth"
fi

current_branch="$(git branch --show-current 2>/dev/null || true)"
if [ -n "$current_branch" ]; then
  if upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
    echo "upstream: $upstream"
  else
    echo "upstream: not configured for $current_branch; PR publication requires a writable remote or maintainer push"
  fi
fi

for required_file in \
  verification_contract.json \
  agile_work_item.json \
  .jarvis/production_grade_profile.json \
  .codex/config/repo.json
do
  if [ -f "$required_file" ]; then
    echo "$required_file present"
  else
    echo "$required_file missing" >&2
    exit 1
  fi
done

node <<'NODE'
const fs = require("node:fs");

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const verification = readJson("verification_contract.json");
const profile = readJson(".jarvis/production_grade_profile.json");
const config = readJson(".codex/config/repo.json");

const sources = [
  ["verification_contract.json#environment.env_file_source", verification.environment?.env_file_source],
  [".jarvis/production_grade_profile.json#deploy_contract.env_file_source", profile.deploy_contract?.env_file_source],
  [".codex/config/repo.json#deploy_contract.env_file_source", config.deploy_contract?.env_file_source],
];

for (const [label, source] of sources) {
  if (typeof source !== "string") {
    throw new Error(`${label} is missing`);
  }
  if (!/process environment|deployment platform/i.test(source)) {
    throw new Error(`${label} must name process environment or deployment platform as the source`);
  }
  if (!/\.env|env file/i.test(source)) {
    throw new Error(`${label} must explicitly reject committed env files`);
  }
}

console.log("env_file_source contract present");
NODE

if [ -f package.json ]; then
  npm run audit:critical
  npm run verify
fi
