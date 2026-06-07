#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="master"

ROOT="$HOME/Documents/Projects/storybook"
FE_DIR="$HOME/Documents/Projects/storybook-claude"
BE_DIR="$HOME/Documents/Projects/storybook-codex"

echo "Checking root repo..."
cd "$ROOT"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Root repo is dirty. Commit or stash first."
  git status --short
  exit 1
fi

echo "Syncing worktrees from $BASE_BRANCH..."

cd "$FE_DIR"
git merge "$BASE_BRANCH" --no-edit

cd "$BE_DIR"
git merge "$BASE_BRANCH" --no-edit

echo "Running agents in parallel..."

(
  cd "$FE_DIR"
  bash scripts/agent-run-one.sh fe
) &
FE_PID=$!

(
  cd "$BE_DIR"
  bash scripts/agent-run-one.sh be
) &
BE_PID=$!

FE_STATUS=0
BE_STATUS=0

wait "$FE_PID" || FE_STATUS=$?
wait "$BE_PID" || BE_STATUS=$?

if [[ "$FE_STATUS" -ne 0 || "$BE_STATUS" -ne 0 ]]; then
  echo "One or more agents failed."
  echo "FE status: $FE_STATUS"
  echo "BE status: $BE_STATUS"
  exit 1
fi

echo "Merging agent branches back to $BASE_BRANCH..."

cd "$ROOT"
git checkout "$BASE_BRANCH"

git merge ai/codex-be --no-edit
git merge ai/claude-fe --no-edit

echo "Running project build..."
pnpm -r build

echo "Agent round complete."
git status --short
