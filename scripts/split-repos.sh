#!/usr/bin/env bash
#
# Готовит вынос perfect-skin и hb-landing в отдельные репозитории.
#
# Историю project_simba НЕ трогает: на боевом сервере лежит клон, который
# обновляется только перемоткой, и переписанная история сломала бы его молча.
# Скрипт лишь вырезает две папки в отдельные репозитории с их историей.
#
# Требует git-filter-repo:  pip3 install git-filter-repo
#
# Запуск:
#   bash scripts/split-repos.sh            # подготовить в /tmp/split
#   bash scripts/split-repos.sh --push     # подготовить и залить
#
# Прогон идемпотентен: сносит прошлый результат и делает заново.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${SPLIT_OUT:-/tmp/split}"
PUSH="${1:-}"

command -v git-filter-repo >/dev/null || {
  echo "нужен git-filter-repo: pip3 install git-filter-repo" >&2; exit 1; }

rm -rf "$OUT"; mkdir -p "$OUT"

split() {  # <папка-в-монорепо> <имя-репозитория-на-github>
  local prefix="$1" remote="$2"
  git clone -q --no-local "$SRC" "$OUT/$prefix"
  ( cd "$OUT/$prefix"
    git filter-repo --force \
      --path "$prefix/" --path "docs/projects/$prefix/" \
      --path-rename "$prefix/:" >/dev/null
    git branch -M main
    git remote add origin "https://github.com/1Herman1/$remote.git" )
  echo "  $remote: $(cd "$OUT/$prefix" && git log --oneline | wc -l) коммитов"
}

split hb-landing  hb_landing
split perfect-skin perfect_skin

# --- Правки, без которых perfect-skin не собирается вне монорепозитория. ---
# Каждая найдена сборкой в изоляции, не предположением.
P="$OUT/perfect-skin"

# 1. Своего корневого package.json у проекта не было: он жил как perfect-skin/*
#    в воркспейсах Симбы.
cat > "$P/package.json" <<'JSON'
{
  "name": "perfect-skin",
  "private": true,
  "workspaces": ["shared", "server", "client"],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "build:shared": "npm run build --workspace=@ps/shared",
    "dev:server": "npm run dev --workspace=@ps/server",
    "dev:client": "npm run dev --workspace=@ps/client",
    "test": "npm run test --workspace=@ps/shared && npm run test --workspace=@ps/server"
  }
}
JSON

python3 - "$P" <<'PY'
import sys, json, pathlib
P = pathlib.Path(sys.argv[1])

# 2. Отдельный клиент Prisma (.prisma/ps-client) был нужен только пока проект
#    делил node_modules с Симбой: стандартный импорт тянул бы её схему. В своём
#    репозитории клиент один, и путь на четыре уровня вверх ведёт уже за
#    пределы репозитория.
p = P/"server/prisma/schema.prisma"; s = p.read_text()
p.write_text(s.replace(
    '  provider = "prisma-client-js"\n  output   = "../../../node_modules/.prisma/ps-client"\n',
    '  provider = "prisma-client-js"\n'))

p = P/"server/src/lib/db.ts"; s = p.read_text()
s = s.replace("""// Prisma-клиент Perfect Skin. По ADR у проекта СВОЙ клиент в .prisma/ps-client —
// импорт стандартного @prisma/client тянул бы клиента Симбы с чужой схемой.""",
"""// Prisma-клиент проекта. Отдельный клиент .prisma/ps-client был нужен, только
// пока проект жил внутри монорепозитория Симбы и делил с ней node_modules.""")
p.write_text(s.replace("'../../../../node_modules/.prisma/ps-client/index.js'", "'@prisma/client'"))

p = P/"server/prisma/seed.ts"; s = p.read_text()
p.write_text(s.replace("'../../../node_modules/.prisma/ps-client/index.js'", "'@prisma/client'"))

p = P/"server/package.json"; j = json.loads(p.read_text())
# 3. Свежий клон обязан собираться одной командой: без генерации клиента Prisma
#    tsc падает на отсутствующих типах схемы. У Симбы это делает деплой-скрипт,
#    у отдельного репозитория такого скрипта нет.
j["scripts"] = {"postinstall": "prisma generate", **j["scripts"]}
# 4. Типы bcryptjs подхватывались из общего корня от Симбы.
j.setdefault("devDependencies", {})["@types/bcryptjs"] = "^2.4.6"
j["devDependencies"] = dict(sorted(j["devDependencies"].items()))
p.write_text(json.dumps(j, indent=2, ensure_ascii=False) + "\n")

# 5. dist попадал в прогон тестов: сборка перед тестами давала падение на
#    скомпилированной копии.
p = P/"shared/vitest.config.ts"; s = p.read_text()
if "exclude" not in s:
    p.write_text(s.replace("  test: {\n    environment: 'node',",
        "  test: {\n    environment: 'node',\n    exclude: ['dist/**', 'node_modules/**'],"))
PY

( cd "$P" && git add -A && git commit -q -m \
"Stand the project up as its own repository

Adds the root package.json it never had, drops the .prisma/ps-client workaround
that existed only to avoid Simba's schema in a shared node_modules, declares
@types/bcryptjs which used to be hoisted from Simba, adds the postinstall that
generates the Prisma client, and keeps dist out of the test run." )

echo "  perfect_skin: +1 коммит с правками для отдельного репозитория"

if [ "$PUSH" = "--push" ]; then
  for d in hb-landing perfect-skin; do
    echo "--- заливка $d ---"
    ( cd "$OUT/$d" && git push -u origin main )
  done
fi

echo
echo "Готово. Перед заливкой проверить в каждом: npm install && npm run build."
