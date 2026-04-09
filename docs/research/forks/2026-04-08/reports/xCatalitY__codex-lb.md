# xCatalitY/codex-lb

- URL: https://github.com/xCatalitY/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-06T21:30:04Z`
- Последний push: `2026-03-07T16:19:47Z`
- Веток в форке: `9`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 164.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 128.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `codex/pr-61`: ahead 6, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `codex/round-robin-routing-strategy`: ahead 5, behind 191. По коммитам видно: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates.
  - Коммиты: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates; synchronize shared balancer runtime mutations.
  - Основные зоны: `frontend/src` (10), `app/modules/settings` (4), `app/core/balancer` (2), `app/db` (2).
- `feature/service-tier-forwarding`: ahead 4, behind 164. По коммитам видно: support service_tier forwarding; support service tier pricing; show service tier in request logs.
  - Коммиты: support service_tier forwarding; support service tier pricing; show service tier in request logs; settle service tier usage correctly.
  - Основные зоны: `openspec` (9), `tests/unit` (5), `app/core/openai` (3), `app/core/usage` (3).
- `fix/pg-ci-failures`: ahead 1, behind 188. По коммитам видно: resolve PostgreSQL CI failures in GROUP BY and async fixtures.
  - Коммиты: resolve PostgreSQL CI failures in GROUP BY and async fixtures.
  - Основные зоны: `app/modules/usage` (1), `tests/conftest.py` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
