# dwnmf/codex-lb

- URL: https://github.com/dwnmf/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-06T20:17:55Z`
- Последний push: `2026-02-28T02:02:24Z`
- Веток в форке: `10`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `4` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions; harden trusted x-forwarded-for chain parsing.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 4, behind 200.
- Уникальные коммиты/темы:
  - migrate firewall backend and React dashboard page
  - fix handler coverage and migration head assertions
  - harden trusted x-forwarded-for chain parsing
  - raise branch coverage for firewall and error utils
- Где менялся код:
  - `frontend/src`: 12 файлов
  - `app/modules/firewall`: 5 файлов
  - `openspec`: 4 файлов
  - `tests/integration`: 3 файлов
  - `tests/unit`: 3 файлов
  - `app/core/middleware`: 2 файлов
- Ключевые изменённые файлы:
  - `.env.example`
  - `app/core/config/settings.py`
  - `app/core/middleware/__init__.py`
  - `app/core/middleware/api_firewall.py`
  - `app/db/alembic/versions/012_add_api_firewall_allowlist.py`
  - `app/db/models.py`
  - `app/dependencies.py`
  - `app/main.py`
  - `app/modules/firewall/__init__.py`
  - `app/modules/firewall/api.py`
  - `app/modules/firewall/repository.py`
  - `app/modules/firewall/schemas.py`

## Default branch vs наш develop

- Статус: diverged, ahead 4, behind 164.
- Dashboard и UX: migrate firewall backend and React dashboard page.
- Маршрутизация, sticky sessions и failover: migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions.
- Совместимость с клиентами и API: migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions.
- База данных и storage: fix handler coverage and migration head assertions.

## Дополнительные ветки в fork

- `chore/uncommitted-snapshot-20260222`: ahead 16, behind 188. По коммитам видно: snapshot uncommitted changes; resolve ruff and ty diagnostics; apply ruff formatting.
  - Коммиты: snapshot uncommitted changes; resolve ruff and ty diagnostics; apply ruff formatting; return anthropic envelope for /v1/messages validation errors.
  - Основные зоны: `app/modules/anthropic_compat` (5), `openspec` (4), `tests/integration` (4), `app/core/openai` (3).
- `fix/close-backlog-and-ty`: ahead 16, behind 216. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func; 123.
  - Основные зоны: `tests/unit` (8), `app/db` (7), `app` (5), `app/modules/firewall` (5).
- `feature/openai-responses`: ahead 15, behind 222. По коммитам видно: expand OpenAI compatibility; map non-stream failures to errors; remove outdated OpenAI compatibility documentation.
  - Коммиты: expand OpenAI compatibility; map non-stream failures to errors; remove outdated OpenAI compatibility documentation; update OpenSpec workflow and documentation guidelines.
  - Основные зоны: `openspec` (35), `app/core/openai` (8), `tests/unit` (6), `tests/integration` (5).
- `fix/totp-ssl-migration-regressions`: ahead 14, behind 216. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func; 123.
  - Основные зоны: `app` (5), `app/db` (5), `app/modules/firewall` (5), `app/core/middleware` (3).
- `chore/sync-soju-v0.6.0`: ahead 11, behind 216. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; firewall func; 123.
  - Основные зоны: `app/modules/firewall` (5), `app` (4), `app/db` (3), `app/core/middleware` (2).
- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `feature/firewall-migration-react`: ahead 9, behind 172. По коммитам видно: migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions; harden trusted x-forwarded-for chain parsing.
  - Коммиты: migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions; harden trusted x-forwarded-for chain parsing; raise branch coverage for firewall and error utils.
  - Основные зоны: `frontend/src` (15), `app/modules/firewall` (5), `openspec` (4), `app/db` (3).
- `codex/feature/dashboard-refresh`: ahead 4, behind 222. По коммитам видно: refactor load path and usage refresh; update uv lock; validate usage refresh interval.
  - Коммиты: refactor load path and usage refresh; update uv lock; validate usage refresh interval; enhance loading state management and disable settings during loading or saving.
  - Основные зоны: `app/modules/dashboard` (5), `app` (4), `app/modules/accounts` (3), `app/modules/usage` (3).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
