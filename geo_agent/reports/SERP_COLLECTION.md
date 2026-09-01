# SERP_COLLECTION

Generated: 2026-09-01T07:05:38+00:00
Topic: vet-clinic-moscow
Provider: xmlriver

## Scope

- query x engine pairs: 63
- requested top URLs per query/engine (`--depth`): 10
- planned paid provider requests: 63
- paid requests succeeded: not run
- paid requests failed: not run
- XMLRiver SERP pages per query/engine: 1
- XMLRiver max live threads: 10
- XMLRiver planned/used thread slots: 10
- region: 213
- language: ru
- SERP rows collected: 0
- AI answer/citation rows collected: 0

## Request Plan

| Engine | Query | Source |
| --- | --- | --- |
| yandex | ветеринарный хирург в москве | semantic_cluster_query |
| yandex | операция для собаки москва | semantic_cluster_query |
| yandex | операция для кошки москва | semantic_cluster_query |
| yandex | операция коту москва | semantic_cluster_query |
| yandex | хирургия для животных в москве | semantic_cluster_query |
| yandex | хирургическая операция для животных в москве цена | semantic_cluster_query |
| yandex | ветеринарная клиника хирургия москва | semantic_cluster_query |
| yandex | ветеринар хирург москва цена | semantic_cluster_query |
| yandex | хирург для животных москва | semantic_cluster_query |
| yandex | операция животному москва | semantic_cluster_query |
| yandex | стерилизация кошки москва | semantic_cluster_query |
| yandex | стерилизация собаки москва | semantic_cluster_query |
| yandex | кастрация кота москва | semantic_cluster_query |
| yandex | кастрация собаки москва | semantic_cluster_query |
| yandex | полостная операция собаке москва | semantic_cluster_query |
| yandex | удаление опухоли у собаки москва | semantic_cluster_query |
| yandex | удаление опухоли у кошки москва | semantic_cluster_query |
| yandex | операция на суставе собаке москва | semantic_cluster_query |
| yandex | остеосинтез собаке москва | semantic_cluster_query |
| yandex | удаление зубов кошке под наркозом москва | semantic_cluster_query |
| yandex | кесарево сечение кошке москва | semantic_cluster_query |
| yandex | операция на глазах собаке москва | semantic_cluster_query |
| yandex | грыжа у собаки операция москва | semantic_cluster_query |
| yandex | пиометра у кошки операция москва | semantic_cluster_query |
| yandex | онкология у животных москва | semantic_cluster_query |
| yandex | узи животным москва | semantic_cluster_query |
| yandex | наркоз для животных безопасный москва | semantic_cluster_query |
| yandex | ветклиника хамовники | semantic_cluster_query |
| yandex | ветеринарная клиника хамовники | semantic_cluster_query |
| yandex | ветеринар хамовники | semantic_cluster_query |
| yandex | ветклиника на плющихе | semantic_cluster_query |
| yandex | ветеринарная клиника плющиха | semantic_cluster_query |
| yandex | ветклиника фрунзенская | semantic_cluster_query |
| yandex | ветеринарная клиника метро фрунзенская | semantic_cluster_query |
| yandex | ветклиника смоленская | semantic_cluster_query |
| yandex | ветеринарная клиника метро смоленская | semantic_cluster_query |
| yandex | ветклиника киевская | semantic_cluster_query |
| yandex | ветеринарная клиника метро киевская | semantic_cluster_query |
| yandex | ветклиника спортивная | semantic_cluster_query |
| yandex | ветеринарная клиника цао | semantic_cluster_query |
| yandex | ветеринарный хирург цао | semantic_cluster_query |
| yandex | ветклиника центр москвы | semantic_cluster_query |
| yandex | ветклиника рядом со мной | semantic_cluster_query |
| yandex | ветеринар рядом со мной москва | semantic_cluster_query |
| yandex | круглосуточная ветклиника хамовники | semantic_cluster_query |
| yandex | ветеринарная клиника ростовская набережная | semantic_cluster_query |
| yandex | ветклиника проспект комсомольский | semantic_cluster_query |
| yandex | круглосуточная ветеринарная клиника москва | semantic_cluster_query |
| yandex | экстренная операция животному москва | semantic_cluster_query |
| yandex | срочная операция собаке москва | semantic_cluster_query |
| yandex | вызов ветеринарного хирурга на дом москва | semantic_cluster_query |
| yandex | второе мнение ветеринар москва | semantic_cluster_query |
| yandex | консультация ветеринарного хирурга москва | semantic_cluster_query |
| yandex | эндоскопическая операция животным москва | semantic_cluster_query |
| yandex | малоинвазивная операция животным москва | semantic_cluster_query |
| yandex | стационар для животных после операции москва | semantic_cluster_query |
| yandex | реанимация для животных москва | semantic_cluster_query |
| yandex | лучший ветеринарный хирург москвы | semantic_cluster_query |
| yandex | ветеринарная клиника премиум класса москва | semantic_cluster_query |
| yandex | ветклиника с современным оборудованием москва | semantic_cluster_query |
| yandex | кт животным москва | semantic_cluster_query |
| yandex | мрт животным москва | semantic_cluster_query |
| yandex | анестезиолог ветеринарный москва | semantic_cluster_query |

## XMLRiver Region And Language

- Google endpoint: `search/xml`; request must include `query`, numeric `loc` from `geo.csv`, and `lr` language code from `langs.xlsx`.
- Yandex endpoint: `search_yandex/xml`; request must include `query`, numeric Yandex `lr` region id, and `lang` language code.
- Region file: https://xmlriver.com/files/geo.csv
- Language file: https://xmlriver.com/files/langs.xlsx
- Country file: https://xmlriver.com/files/countries.xlsx
- Domain file: https://xmlriver.com/files/domains.xlsx
- Do not rely on XMLRiver account defaults for GEO/language; pass the run scope explicitly.
- `--depth` means requested organic URL count/top-N, not number of pagination pages.
- XMLRiver returns 10 organic URLs per SERP page; top-100 means 10 paid page requests per query x engine.
- Google `page` starts at 1; Yandex `page` starts at 0.
- `groupby` is fixed at 10 for Google/Yandex SERP collection in current XMLRiver docs; do not treat it as a way to fetch top-100 in one paid request.
- Approved live XMLRiver collection uses the maximum 10 standard-account threads for the paid page-request queue.

## Errors / Limits

- Live collection not run: dry run.
