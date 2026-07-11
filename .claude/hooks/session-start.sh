#!/bin/bash
set -euo pipefail

# Switch to the working branch at session start
BRANCH="claude/greeting-nnz368"

cd "$CLAUDE_PROJECT_DIR"

CURRENT=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT" != "$BRANCH" ]; then
  git checkout "$BRANCH"
fi

git pull origin "$BRANCH" --ff-only 2>/dev/null || true
