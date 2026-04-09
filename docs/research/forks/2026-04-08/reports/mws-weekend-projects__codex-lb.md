# mws-weekend-projects/codex-lb

- URL: https://github.com/mws-weekend-projects/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-02T10:48:00Z`
- Последний push: `2026-03-23T14:17:17Z`
- Веток в форке: `8`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 168.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 132.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `mwa-features`: ahead 18, behind 161. По коммитам видно: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs; enforce model and reasoning effort per key.
  - Коммиты: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs; enforce model and reasoning effort per key; widen settings layout and api-key table columns.
  - Основные зоны: `frontend/src` (9), `frontend/dashboard` (9), `frontend/accounts` (7), `tests/integration` (5).
- `fix/credits-aware-quota-and-no-account-logs`: ahead 10, behind 105. По коммитам видно: add plus burn metric card; stabilize plus burn secondary estimate; add live account burnrate toggle.
  - Коммиты: add plus burn metric card; stabilize plus burn secondary estimate; add live account burnrate toggle; rename plus burn to account burn rate.
  - Основные зоны: `frontend/dashboard` (9), `frontend/src` (6), `app/db` (3), `app/modules/dashboard` (3).
- `feat/plus-account-burnrate-chart-from-main`: ahead 9, behind 105. По коммитам видно: add plus burn metric card; stabilize plus burn secondary estimate; add live account burnrate toggle.
  - Коммиты: add plus burn metric card; stabilize plus burn secondary estimate; add live account burnrate toggle; rename plus burn to account burn rate.
  - Основные зоны: `frontend/dashboard` (9), `frontend/src` (6), `app/db` (3), `app/modules/dashboard` (3).
- `fix/credits-aware-quota-and-dashboard`: ahead 7, behind 188. По коммитам видно: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs; enforce model and reasoning effort per key.
  - Коммиты: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs; enforce model and reasoning effort per key; resolve main merge in migration integration tests.
  - Основные зоны: `frontend/dashboard` (7), `frontend/src` (5), `app/modules/api_keys` (4), `app/modules/request_logs` (4).
- `pr/credits-aware-quota-and-dashboard`: ahead 3, behind 168. По коммитам видно: Allow credit-backed accounts past weekly quota; Show live account credits in the dashboard; Handle unassigned request logs in the dashboard.
  - Коммиты: Allow credit-backed accounts past weekly quota; Show live account credits in the dashboard; Handle unassigned request logs in the dashboard.
  - Основные зоны: `frontend/dashboard` (4), `app/modules/accounts` (2), `frontend/src` (2), `app/core/usage` (1).
- `feature/windows-oauth-runtime-connect-help`: ahead 2, behind 188. По коммитам видно: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs.
  - Коммиты: add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs.
  - Основные зоны: `frontend/dashboard` (5), `app/modules/request_logs` (4), `frontend/accounts` (4), `app/modules/settings` (2).
- `pr/account-burnrate-squash`: ahead 1, behind 105. По коммитам видно: account burn rate card with settings toggle.
  - Коммиты: account burn rate card with settings toggle.
  - Основные зоны: `frontend/dashboard` (5), `frontend/src` (5), `.dockerignore` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
