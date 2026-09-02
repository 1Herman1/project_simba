#!/usr/bin/env python3
"""Сбор частотности запросов через Wordstat XMLRiver (новый API).

Отвечает на вопрос, которого нет в сборе выдачи: СКОЛЬКО людей задают
запрос. Без этого карта конкуренции слепа на один глаз — можно выйти в
топ-1 по запросу, который никто не ищет.

Новый Wordstat отдаёт не одно число, а два списка фраз с частотностями:
`popular` (похожие запросы) и `associations` (что ещё ищут). Частотность
самой фразы ищем по точному совпадению текста; связанные фразы попутно
сохраняем — это готовый материал для расширения семантики.

Запуск:
    python tools/collect_wordstat.py <файл-запросов> <куда-csv> [--region 213]

Учётные данные читаются из окружения (XMLRIVER_USER, XMLRIVER_KEY) —
ни в аргументах, ни в выводе они не появляются.
"""
import csv
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ENDPOINT = "https://xmlriver.com/wordstat/new/json"
MOSCOW_REGION = "213"
RELATED_KEPT = 15  # сколько связанных фраз сохраняем на запрос


def normalize(text: str) -> str:
    """Приводит фразу к сравнимому виду: регистр, ё/е, лишние пробелы."""
    return re.sub(r"\s+", " ", text.lower().replace("ё", "е")).strip()


def fetch(query: str, user: str, key: str, region: str, timeout: int = 45) -> dict:
    params = urllib.parse.urlencode(
        {"user": user, "key": key, "query": query, "regions": region}
    )
    with urllib.request.urlopen(f"{ENDPOINT}?{params}", timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8", errors="replace"))


def to_int(value) -> int | None:
    if isinstance(value, (int, float)):
        return int(value)
    if isinstance(value, str):
        digits = value.replace(" ", "").replace(" ", "")
        if digits.isdigit():
            return int(digits)
    return None


def extract(payload: dict, query: str) -> tuple[int | None, list[tuple[str, int]], str]:
    """Возвращает (частотность фразы, связанные фразы, примечание)."""
    if not isinstance(payload, dict):
        return None, [], "ответ не является объектом"
    if payload.get("error"):
        return None, [], str(payload["error"])[:200]

    items: list[tuple[str, int]] = []
    for bucket in ("popular", "associations"):
        for entry in payload.get(bucket) or []:
            if not isinstance(entry, dict):
                continue
            shows = to_int(entry.get("value"))
            text = entry.get("text")
            if shows is not None and isinstance(text, str):
                items.append((text, shows))

    if not items:
        return None, [], f"списки фраз пусты; ключи ответа: {list(payload)[:8]}"

    target = normalize(query)
    exact = next((s for t, s in items if normalize(t) == target), None)
    related = sorted(items, key=lambda x: -x[1])[:RELATED_KEPT]
    note = "" if exact is not None else "точного совпадения фразы в ответе нет"
    return exact, related, note


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    queries_path, out_path = sys.argv[1], sys.argv[2]
    region = MOSCOW_REGION
    if "--region" in sys.argv:
        region = sys.argv[sys.argv.index("--region") + 1]

    user = os.environ.get("XMLRIVER_USER", "").strip()
    key = os.environ.get("XMLRIVER_KEY", "").strip()
    if not user or not key:
        print("Нет XMLRIVER_USER / XMLRIVER_KEY в окружении.", file=sys.stderr)
        return 1

    with open(queries_path, encoding="utf-8") as fh:
        queries = [
            line.strip()
            for line in fh
            if line.strip() and not line.lstrip().startswith("#")
        ]

    print(f"Запросов к сбору частотности: {len(queries)}, регион {region}")

    rows, related_rows, with_number = [], [], 0
    for i, query in enumerate(queries, 1):
        try:
            payload = fetch(query, user, key, region)
            shows, related, note = extract(payload, query)
        except Exception as exc:  # сеть/таймаут — не роняем весь прогон
            shows, related, note = None, [], f"{type(exc).__name__}: {exc}"[:200]

        if shows is not None:
            with_number += 1
        rows.append(
            {"query": query, "shows": "" if shows is None else shows, "note": note}
        )
        for text, value in related:
            related_rows.append({"seed": query, "phrase": text, "shows": value})

        shown = shows if shows is not None else f"нет числа ({note})"
        print(f"[{i}/{len(queries)}] {query} -> {shown}")
        time.sleep(0.2)  # бережём лимит потоков

    out_dir = os.path.dirname(out_path) or "."
    os.makedirs(out_dir, exist_ok=True)

    with open(out_path, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["query", "shows", "note"])
        writer.writeheader()
        writer.writerows(rows)

    related_path = os.path.join(out_dir, "wordstat-related.csv")
    with open(related_path, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["seed", "phrase", "shows"])
        writer.writeheader()
        writer.writerows(related_rows)

    print(f"\nЧастотность получена для {with_number} из {len(rows)} запросов.")
    print(f"Файлы: {out_path}, {related_path} ({len(related_rows)} связанных фраз)")
    return 0 if with_number else 1


if __name__ == "__main__":
    raise SystemExit(main())
