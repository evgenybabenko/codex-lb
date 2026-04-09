# azkore/codex-lb

- URL: https://github.com/azkore/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-16T16:32:54Z`
- Последний push: `2026-02-27T08:19:28Z`
- Веток в форке: `7`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 215.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 179.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `feature/auth-and-api-keys`: ahead 16, behind 215. По коммитам видно: implement password-based authentication and API key support; complete react migration with bun-based workflow; archive completed changes and sync specs.
  - Коммиты: implement password-based authentication and API key support; complete react migration with bun-based workflow; archive completed changes and sync specs; preserve 404 detail casing for unknown api routes.
  - Основные зоны: `frontend/src` (86), `openspec` (30), `app/db` (24), `frontend/dashboard` (21).
- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `codex/pr-61`: ahead 6, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `fix/free-weekly-quota-windows`: ahead 6, behind 203. По коммитам видно: normalize weekly-only free quotas as 7d windows; persist plan upgrades from usage payload; align weekly-only quota rendering with usage semantics.
  - Коммиты: normalize weekly-only free quotas as 7d windows; persist plan upgrades from usage payload; align weekly-only quota rendering with usage semantics; apply ruff formatting for CI.
  - Основные зоны: `frontend/accounts` (6), `tests/integration` (6), `frontend/dashboard` (5), `app/modules/usage` (4).
- `fix/oauth-device-flow-main`: ahead 1, behind 183. По коммитам видно: start device polling immediately after device start.
  - Коммиты: start device polling immediately after device start.
  - Основные зоны: `frontend/accounts` (2).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
