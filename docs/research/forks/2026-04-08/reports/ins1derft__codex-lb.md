# ins1derft/codex-lb

- URL: https://github.com/ins1derft/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-25T17:56:44Z`
- Последний push: `2026-02-27T19:26:35Z`
- Веток в форке: `2`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `4` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP; add new skill.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 4, behind 191.
- Уникальные коммиты/темы:
  - add RBAC users and owned API-key account scoping
  - add email OTP credential import via IMAP
  - add new skill
- Где менялся код:
  - `frontend/src`: 25 файлов
  - `openspec`: 19 файлов
  - `tests/integration`: 15 файлов
  - `app/modules/accounts`: 9 файлов
  - `frontend/accounts`: 7 файлов
  - `frontend/dashboard`: 6 файлов
- Ключевые изменённые файлы:
  - `.agents/skills/maintain-codex-lb/SKILL.md`
  - `.agents/skills/maintain-codex-lb/agents/openai.yaml`
  - `.agents/skills/maintain-codex-lb/references/architecture.md`
  - `.env.example`
  - `app/core/auth/dependencies.py`
  - `app/core/config/settings.py`
  - `app/core/exceptions.py`
  - `app/core/handlers/exceptions.py`
  - `app/db/alembic/versions/013_add_dashboard_users_and_resource_ownership.py`
  - `app/db/models.py`
  - `app/dependencies.py`
  - `app/main.py`

## Default branch vs наш develop

- Статус: diverged, ahead 4, behind 155.
- Dashboard и UX: add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP.
- Usage, квоты и тарификация: add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP.
- Аутентификация и доступ: add RBAC users and owned API-key account scoping.
- Маршрутизация, sticky sessions и failover: add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP.

## Дополнительные ветки в fork

- `feature/dashboard-rbac-multi-account`: ahead 1, behind 191. По коммитам видно: add RBAC users and owned API-key account scoping.
  - Коммиты: add RBAC users and owned API-key account scoping.
  - Основные зоны: `frontend/src` (25), `tests/integration` (15), `openspec` (13), `app/modules/accounts` (8).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
