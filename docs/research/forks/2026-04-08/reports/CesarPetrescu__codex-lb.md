# CesarPetrescu/codex-lb

- URL: https://github.com/CesarPetrescu/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-25T18:37:34Z`
- Последний push: `2026-03-15T19:08:01Z`
- Веток в форке: `4`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `7` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: enforce admin-token access and expand API key management; add full admin API usage runbook; support dashboard base path and partial settings updates.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 7, behind 191.
- Уникальные коммиты/темы:
  - enforce admin-token access and expand API key management
  - add full admin API usage runbook
  - support dashboard base path and partial settings updates
  - import loadEnv from vite
- Где менялся код:
  - `frontend/src`: 30 файлов
  - `openspec`: 6 файлов
  - `frontend/dashboard`: 5 файлов
  - `app/modules/api_keys`: 3 файлов
  - `tests/integration`: 3 файлов
  - `app/modules/settings`: 2 файлов
- Ключевые изменённые файлы:
  - `.env.example`
  - `README.md`
  - `api.md`
  - `app/core/auth/dependencies.py`
  - `app/core/config/settings.py`
  - `app/core/errors.py`
  - `app/core/handlers/exceptions.py`
  - `app/db/models.py`
  - `app/modules/accounts/api.py`
  - `app/modules/api_keys/api.py`
  - `app/modules/api_keys/schemas.py`
  - `app/modules/api_keys/service.py`

## Default branch vs наш develop

- Статус: diverged, ahead 7, behind 155.
- Helm и деплой: enforce admin-token access and expand API key management; add full admin API usage runbook.
- Dashboard и UX: support dashboard base path and partial settings updates; Fix dashboard request log schema for unassigned accounts.
- Usage, квоты и тарификация: add full admin API usage runbook.
- Аутентификация и доступ: enforce admin-token access and expand API key management.

## Дополнительные ветки в fork

- `cdx/2026-02-26/10-27-51/add-frontend-base-path-support`: ahead 3, behind 191. По коммитам видно: enforce admin-token access and expand API key management; add full admin API usage runbook; support dashboard base path and partial settings updates.
  - Коммиты: enforce admin-token access and expand API key management; add full admin API usage runbook; support dashboard base path and partial settings updates.
  - Основные зоны: `frontend/src` (26), `openspec` (6), `app/modules/api_keys` (3), `tests/integration` (3).
- `feature/admin-token-api-guide-auth-lock`: ahead 1, behind 191. По коммитам видно: enforce admin-token access and expand API key management.
  - Коммиты: enforce admin-token access and expand API key management.
  - Основные зоны: `frontend/src` (25), `openspec` (6), `app/modules/api_keys` (3), `tests/integration` (2).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
