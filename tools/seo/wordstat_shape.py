#!/usr/bin/env python3
"""Печатает СТРУКТУРУ ответа Wordstat, а не его содержимое.

Нужен, чтобы понять, под каким ключом лежит частотность, не выводя в лог
данные аккаунта. Значения обрезаются до 40 символов.

Читает JSON со stdin. Выходной код 1, если сервис вернул ошибку.
"""
import json
import sys


def shape(obj, depth: int = 0, max_depth: int = 3) -> None:
    pad = "  " * depth
    if isinstance(obj, dict):
        for key, val in list(obj.items())[:12]:
            if isinstance(val, (dict, list)):
                print(f"{pad}{key}: {type(val).__name__}[{len(val)}]")
                if depth < max_depth:
                    shape(val, depth + 1, max_depth)
            else:
                print(f"{pad}{key}: {type(val).__name__} = {str(val)[:40]}")
    elif isinstance(obj, list) and obj:
        print(f"{pad}[0] из {len(obj)}:")
        shape(obj[0], depth + 1, max_depth)


def main() -> int:
    raw = sys.stdin.read()
    try:
        data = json.loads(raw)
    except Exception as exc:
        print(f"Ответ не является JSON: {exc}")
        print(raw[:300])
        return 1

    if isinstance(data, dict) and data.get("error"):
        print(f"::error::Wordstat отклонил запрос: {data['error']}")
        return 1

    shape(data)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
