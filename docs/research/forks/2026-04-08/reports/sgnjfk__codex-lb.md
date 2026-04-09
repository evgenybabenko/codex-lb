# sgnjfk/codex-lb

- URL: https://github.com/sgnjfk/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-28T13:37:28Z`
- Последний push: `2026-03-28T13:39:19Z`
- Веток в форке: `12`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 69.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 33.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `feat/additional-usage-depletion`: ahead 56, behind 143. По коммитам видно: archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404); add Pydantic models for additional rate limits.
  - Коммиты: archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404); add Pydantic models for additional rate limits; implement EWMA depletion engine.
  - Основные зоны: `frontend/dashboard` (9), `tests/unit` (8), `.sisyphus` (5), `app/modules/proxy` (5).
- `feature/upstream-websocket-transport-control`: ahead 19, behind 117. По коммитам видно: add upstream websocket transport control; address websocket review findings; stabilize theme storage tests.
  - Коммиты: add upstream websocket transport control; address websocket review findings; stabilize theme storage tests; strip websocket headers case-insensitively.
  - Основные зоны: `frontend/src` (9), `tests/integration` (5), `app/modules/settings` (4), `openspec` (4).
- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `fix/sticky-session-affinity-operations`: ahead 8, behind 128. По коммитам видно: add sticky session controls and cleanup; address lint and migration checks; align migration chain and coverage.
  - Коммиты: add sticky session controls and cleanup; address lint and migration checks; align migration chain and coverage; make sticky session tests postgres-safe.
  - Основные зоны: `frontend/src` (20), `openspec` (10), `app/modules/sticky_sessions` (5), `app/modules/settings` (4).
- `codex/pr-61`: ahead 6, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `codex/round-robin-routing-strategy`: ahead 5, behind 191. По коммитам видно: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates.
  - Коммиты: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates; synchronize shared balancer runtime mutations.
  - Основные зоны: `frontend/src` (10), `app/modules/settings` (4), `app/core/balancer` (2), `app/db` (2).
- `feature/service-tier-forwarding`: ahead 4, behind 164. По коммитам видно: support service_tier forwarding; support service tier pricing; show service tier in request logs.
  - Коммиты: support service_tier forwarding; support service tier pricing; show service tier in request logs; settle service tier usage correctly.
  - Основные зоны: `openspec` (9), `tests/unit` (5), `app/core/openai` (3), `app/core/usage` (3).
- `feat/export-endpoint`: ahead 1, behind 69. По коммитам видно: Add /api/accounts/export endpoint.
  - Коммиты: Add /api/accounts/export endpoint.
  - Основные зоны: `app/modules/accounts` (3).
- `fix/pg-ci-failures`: ahead 1, behind 188. По коммитам видно: resolve PostgreSQL CI failures in GROUP BY and async fixtures.
  - Коммиты: resolve PostgreSQL CI failures in GROUP BY and async fixtures.
  - Основные зоны: `app/modules/usage` (1), `tests/conftest.py` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
