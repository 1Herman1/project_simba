#!/bin/bash
set -euo pipefail

CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$CLAUDE_PROJECT_DIR"

INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
else
  FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed -E 's/.*"file_path"[[:space:]]*:[[:space:]]*"([^"]*)"/\1/')
fi

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.tsx)
    ;;
  *)
    exit 0
    ;;
esac

case "$FILE_PATH" in
  client/*|admin/*|*/client/*|*/admin/*)
    ;;
  *)
    exit 0
    ;;
esac

node "$CLAUDE_PROJECT_DIR/.claude/scripts/design-lint.mjs" "$FILE_PATH"

exit 0
