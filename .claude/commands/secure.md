---
description: Аудит безопасности проекта через security-department
---

Запусти аудит безопасности через `security-department`.

Он сам подберёт специалистов и запустит параллельно:
- `security-auth-access` — JWT, OTP, сессии, IDOR, роли
- `security-secrets-scanner` — утечки секретов в коде и git
- `security-infra-cloud` — env, CORS, заголовки, MinIO, docker-compose
- `security-dependency-audit` — уязвимости в npm-зависимостях

Собери единый отчёт по severity, убери дубли между агентами (см. разделение
ответственности в `CLAUDE.md`). По каждой находке — конкретный сценарий атаки
простыми словами и как исправить. Репортить только при уверенности ≥ 80%.
