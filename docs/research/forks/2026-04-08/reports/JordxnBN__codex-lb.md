# JordxnBN/codex-lb

- URL: https://github.com/JordxnBN/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-19T14:42:26Z`
- Последний push: `2026-02-27T09:58:28Z`
- Веток в форке: `6`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 191.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 155.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `fix/opencode-compat-clean`: ahead 15, behind 197. По коммитам видно: normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat; make Windows launcher path portable.
  - Коммиты: normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat; make Windows launcher path portable; scope v1 stream compat and fix schema mapping.
  - Основные зоны: `app/core/openai` (4), `openspec` (4), `tests/unit` (3), `app/modules/proxy` (2).
- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `jdev`: ahead 7, behind 191. По коммитам видно: Ignore local runtime data and opencode config; normalize container paths and add account merge utility; refresh uv.lock for v1.0.4 and ignore local startup scripts.
  - Коммиты: Ignore local runtime data and opencode config; normalize container paths and add account merge utility; refresh uv.lock for v1.0.4 and ignore local startup scripts; add selection decision observability endpoint and logging.
  - Основные зоны: `frontend/src` (19), `openspec` (4), `app/modules/proxy` (3), `app/modules/proxy_debug` (3).
- `codex/pr-61`: ahead 6, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `fix/opencode-compat`: ahead 2, behind 200. По коммитам видно: normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat.
  - Коммиты: normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat.
  - Основные зоны: `app/core/openai` (4), `openspec` (4), `tests/unit` (3), `README.md` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
