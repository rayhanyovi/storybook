#!/usr/bin/env bash
set -euo pipefail

AGENT="${1:-}"

if [[ "$AGENT" != "fe" && "$AGENT" != "be" ]]; then
  echo "Usage: bash scripts/agent-run-one.sh fe|be"
  exit 1
fi

if [[ "$AGENT" == "fe" ]]; then
  QUEUE="queues/frontend.md"
  LOG_FILE="logs/frontend.md"
  ROLE="Frontend Agent"
  SCOPE=$(cat <<'SCOPE_EOF'
Scope:
- You may edit apps/web/**
- You may edit logs/frontend.md
- You may edit queues/frontend.md only if instructed, but the runner normally marks tasks done.
- Do not edit apps/api/**
- Do not edit apps/api/prisma/**
- Do not edit apps/api/tests/**
- Do not edit packages/shared/**
- Do not edit root config files or lockfiles.
- Do not install dependencies. If you need one, stop and explain.
SCOPE_EOF
)
  READS=$(cat <<'READS_EOF'
Read:
- AGENTS.md
- docs/DESIGN.md
- docs/PRODUCT.md
- docs/TECH.md
- packages/shared/src/index.ts
READS_EOF
)
else
  QUEUE="queues/backend.md"
  LOG_FILE="logs/backend.md"
  ROLE="Backend Agent"
  SCOPE=$(cat <<'SCOPE_EOF'
Scope:
- You may edit apps/api/**
- You may edit apps/api/prisma/**
- You may edit apps/api/tests/**
- You may edit logs/backend.md
- You may edit queues/backend.md only if instructed, but the runner normally marks tasks done.
- Do not edit apps/web/**
- Do not edit packages/shared/**
- Do not edit root config files or lockfiles.
- Do not install dependencies. If you need one, stop and explain.
SCOPE_EOF
)
  READS=$(cat <<'READS_EOF'
Read:
- AGENTS.md
- docs/TECH.md
- docs/PRODUCT.md
- packages/shared/src/index.ts
READS_EOF
)
fi

NEXT_LINE="$(grep -nE '^- \[ \] ' "$QUEUE" | head -n 1 || true)"

if [[ -z "$NEXT_LINE" ]]; then
  echo "No pending task for $AGENT in $QUEUE"
  exit 0
fi

LINE_NO="${NEXT_LINE%%:*}"
TASK_LINE="${NEXT_LINE#*:}"
TASK_TEXT="${TASK_LINE#- [ ] }"

mkdir -p .agent/prompts .agent/results

PROMPT_FILE=".agent/prompts/${AGENT}-next.md"
RESULT_FILE=".agent/results/${AGENT}-$(date +%Y%m%d-%H%M%S).log"

cat > "$PROMPT_FILE" <<EOF_PROMPT
You are the ${ROLE}.

${READS}

${SCOPE}

Current task:
${TASK_TEXT}

Rules:
- Implement only the current task.
- Do not implement future tasks.
- Do not change architecture.
- Keep changes small and reviewable.
- Do not commit. The runner will commit.
- Update ${LOG_FILE} with:
  - date
  - task
  - files changed
  - implementation summary
  - test commands
  - known issues
- Stop after completing the task.
EOF_PROMPT

echo "Running $AGENT task:"
echo "$TASK_TEXT"
echo

if [[ "$AGENT" == "fe" ]]; then
  claude -p "$(cat "$PROMPT_FILE")" --allowedTools "Read,Write,Edit,MultiEdit,Bash" | tee "$RESULT_FILE"
else
  codex exec --sandbox workspace-write --ask-for-approval never "$(cat "$PROMPT_FILE")" | tee "$RESULT_FILE"
fi

# Mark task done only if agent command succeeds.
sed -i "${LINE_NO}s/^- \[ \]/- [x]/" "$QUEUE"

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  SAFE_TASK="$(echo "$TASK_TEXT" | cut -c1-72)"
  git commit -m "agent(${AGENT}): ${SAFE_TASK}"
else
  echo "No changes to commit for $AGENT"
fi
