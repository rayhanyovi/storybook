#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Documents/Projects/storybook"
CLAUDE="$HOME/Documents/Projects/storybook-claude"
CODEX="$HOME/Documents/Projects/storybook-codex"
BASE_BRANCH="master"

echo "== Checking Claude worktree =="
cd "$CLAUDE"

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "agent(claude): sync frontend progress"
else
  echo "No Claude changes to commit."
fi

echo "== Checking Codex worktree =="
cd "$CODEX"

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "agent(codex): sync backend progress"
else
  echo "No Codex changes to commit."
fi

echo "== Merging agents into main project =="
cd "$ROOT"
git checkout "$BASE_BRANCH"

echo "Merging Codex backend branch..."
git merge ai/codex-be --no-edit

echo "Merging Claude frontend branch..."
git merge ai/claude-fe --no-edit

echo "== Running build check =="
pnpm -r build

echo "== Syncing agent worktrees back from $BASE_BRANCH =="

cd "$CLAUDE"
git merge "$BASE_BRANCH" --no-edit

cd "$CODEX"
git merge "$BASE_BRANCH" --no-edit

echo "== Done. Main project now has both agents' progress. =="
cd "$ROOT"
git status --short
