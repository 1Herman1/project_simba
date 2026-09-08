#!/bin/bash
# Архиватор сессии. Вызывается хуками PreCompact / SessionEnd / Stop.
#
# Собирает из стенограммы сухой остаток: реплики пользователя, изменённые
# файлы проекта, запущенных агентов, ошибки и коммиты. Пишет в
# docs/archive/sessions/. LLM не задействован — только факты.
#
# Инкрементальность: смещение прочитанного хранится в .claude/.archive-state/,
# поэтому вызов на Stop (после каждого ответа) стоит доли секунды.
#
# Секреты маскируются перед записью — архив уходит в git.

set -uo pipefail

TRIGGER="${1:-manual}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$PROJECT_DIR" || exit 0

# Хук не имеет права ломать сессию: любая неожиданность — тихий выход.
INPUT=$(cat 2>/dev/null || echo '{}')
command -v jq >/dev/null 2>&1 || exit 0

SESSION_ID=$(printf '%s' "$INPUT" | jq -r '.session_id // empty' 2>/dev/null)
CWD=$(printf '%s' "$INPUT" | jq -r '.cwd // empty' 2>/dev/null)
[ -z "$SESSION_ID" ] && exit 0
[ -z "$CWD" ] && CWD="$PROJECT_DIR"

# Хуки не отдают путь к стенограмме. Кодировку имени папки не угадываем
# (Claude Code заменяет дефисом и слэш, и подчёркивание) — ищем файл по
# session_id: устойчиво к любым правилам именования.
TRANSCRIPT=""
for d in "$HOME/.claude/projects"/*/; do
  if [ -f "$d$SESSION_ID.jsonl" ]; then TRANSCRIPT="$d$SESSION_ID.jsonl"; break; fi
done
[ -n "$TRANSCRIPT" ] || exit 0

STATE_DIR="$PROJECT_DIR/.claude/.archive-state"
mkdir -p "$STATE_DIR" 2>/dev/null || exit 0
OFFSET_FILE="$STATE_DIR/$SESSION_ID.offset"
OFFSET=0
[ -f "$OFFSET_FILE" ] && OFFSET=$(cat "$OFFSET_FILE" 2>/dev/null || echo 0)
case "$OFFSET" in ''|*[!0-9]*) OFFSET=0 ;; esac

SIZE=$(wc -c < "$TRANSCRIPT" 2>/dev/null || echo 0)
# Файл усечён или пересоздан — читаем заново.
[ "$SIZE" -lt "$OFFSET" ] && OFFSET=0
# Нового нет — выходим, не трогая архив.
[ "$SIZE" -le "$OFFSET" ] && exit 0

NEW=$(mktemp) || exit 0
trap 'rm -f "$NEW"' EXIT
tail -c "+$((OFFSET + 1))" "$TRANSCRIPT" > "$NEW" 2>/dev/null || exit 0

# Маскировка секретов. Последний рубеж перед записью в git: в стенограммах
# реально встречаются вставленные в чат ключи.
redact() {
  sed -E \
    -e 's/\b[a-fA-F0-9]{32,}\b/[СКРЫТО]/g' \
    -e 's/\b(gh[pousr]_[A-Za-z0-9]{20,})/[СКРЫТО]/g' \
    -e 's/\b(sk-[A-Za-z0-9_-]{20,})/[СКРЫТО]/g' \
    -e 's/(KEY|TOKEN|SECRET|PASSWORD|PASSWD|APIKEY)("?[[:space:]]*[:=][[:space:]]*"?)[^ ",;]{8,}/\1\2[СКРЫТО]/gI'
}

# --- реплики пользователя ---
# toolUseResult == null — надёжный признак настоящей реплики человека:
# результаты инструментов и отчёты субагентов приходят тем же типом "user",
# но всегда с этим полем.
USER_MSGS=$(jq -r 'select(.type=="user" and (.isMeta != true) and (.toolUseResult == null))
  | .message.content
  | (if type=="string" then . elif type=="array" then (map(select(.type=="text").text) | join(" ")) else "" end)
  | gsub("[\\r\\n\\t]+"; " ") | gsub("  +"; " ")' \
  "$NEW" 2>/dev/null \
  | grep -vE '^[[:space:]]*$' \
  | grep -vE '^[[:space:]]*<' \
  | grep -vE '<(command-name|command-message|command-args|local-command|system-reminder|bash-|user-prompt|untrusted|github-webhook|task-|tool-use-id|output-file|wake |webhook-)' \
  | grep -vE '^[[:space:]]*(Caveat:|The messages below|\[Request interrupted|\[Image:|✓|✗|Note:)' \
  | awk 'length > 12' \
  | uniq \
  | cut -c1-400 | redact)

# --- изменённые файлы: только внутри проекта, без временных ---
FILES=$(jq -r 'select(.type=="assistant") | .message.content[]?
  | select(.type=="tool_use") | select(.name=="Write" or .name=="Edit" or .name=="NotebookEdit")
  | .input.file_path // empty' "$NEW" 2>/dev/null \
  | grep -vE '^(/tmp/|/root/\.claude/|/var/)' \
  | sed "s|^$PROJECT_DIR/||" | sort -u)

# --- запущенные агенты ---
AGENTS=$(jq -r 'select(.type=="assistant") | .message.content[]?
  | select(.type=="tool_use") | select(.name=="Agent")
  | (.input.subagent_type // "general") + " — " + (.input.description // "")' \
  "$NEW" 2>/dev/null | sort -u | cut -c1-120)

# --- ход работы: что падало ---
ERRORS=$(jq -r 'select(.type=="user") | .message.content[]?
  | select(.type=="tool_result") | select(.is_error == true)
  | (if (.content|type)=="string" then .content else ((.content[]?|select(.type=="text").text) // "") end)' \
  "$NEW" 2>/dev/null | grep -vE '^[[:space:]]*$' | cut -c1-200 | head -20 | redact)

if [ -z "$USER_MSGS" ] && [ -z "$FILES" ]; then
  printf '%s' "$SIZE" > "$OFFSET_FILE"
  exit 0
fi

DATE=$(date +%Y-%m-%d)
SHORT=$(printf '%s' "$SESSION_ID" | cut -c1-8)
OUT="$PROJECT_DIR/docs/archive/sessions/$DATE--$SHORT.md"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")

if [ ! -f "$OUT" ]; then
  {
    echo "---"
    echo "session: $SESSION_ID"
    echo "date: $DATE"
    echo "branch: $BRANCH"
    echo "status: raw"
    echo "---"
    echo
    echo "# Сессия $DATE"
  } > "$OUT"
fi

{
  echo
  echo "## Фрагмент ($(date +%H:%M), триггер: $TRIGGER)"
  if [ -n "$USER_MSGS" ]; then
    echo
    echo "### Просил"
    printf '%s\n' "$USER_MSGS" | sed 's/^/- /'
  fi
  if [ -n "$FILES" ]; then
    echo
    echo "### Изменённые файлы"
    printf '%s\n' "$FILES" | sed 's/^/- /'
  fi
  if [ -n "$AGENTS" ]; then
    echo
    echo "### Агенты"
    printf '%s\n' "$AGENTS" | sed 's/^/- /'
  fi
  if [ -n "$ERRORS" ]; then
    echo
    echo "### Споткнулись"
    printf '%s\n' "$ERRORS" | sed 's/^/- /'
  fi
} >> "$OUT"

# Коммиты берём из git, а не парсингом команд — надёжнее.
COMMITS=$(git log --format='%h %s' --since='16 hours ago' 2>/dev/null | head -15)
if [ -n "$COMMITS" ]; then
  TMP=$(mktemp)
  awk '/^## Коммиты сессии$/{skip=1} skip&&/^## /&&!/^## Коммиты сессии$/{skip=0} !skip' "$OUT" > "$TMP" 2>/dev/null
  mv "$TMP" "$OUT" 2>/dev/null
  { echo; echo "## Коммиты сессии"; printf '%s\n' "$COMMITS" | sed 's/^/- /'; } >> "$OUT"
fi

printf '%s' "$SIZE" > "$OFFSET_FILE"
exit 0
