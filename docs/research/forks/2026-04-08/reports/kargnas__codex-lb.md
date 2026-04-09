# kargnas/codex-lb

- URL: https://github.com/kargnas/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-14T11:02:00Z`
- Последний push: `2026-03-31T11:19:42Z`
- Веток в форке: `3`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `1` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add usage tracking, failover routing, and dashboard support.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 1, behind 215.
- Уникальные коммиты/темы:
  - add usage tracking, failover routing, and dashboard support
- Где менялся код:
  - `tests/integration`: 7 файлов
  - `app/modules/proxy`: 5 файлов
  - `app/modules/usage`: 5 файлов
  - `app/core/usage`: 3 файлов
  - `app/db`: 3 файлов
  - `app/modules/accounts`: 3 файлов
- Ключевые изменённые файлы:
  - `app/core/usage/__init__.py`
  - `app/core/usage/models.py`
  - `app/core/usage/types.py`
  - `app/db/migrations/__init__.py`
  - `app/db/migrations/versions/add_usage_history_window_label.py`
  - `app/db/models.py`
  - `app/modules/accounts/mappers.py`
  - `app/modules/accounts/schemas.py`
  - `app/modules/accounts/service.py`
  - `app/modules/dashboard/schemas.py`
  - `app/modules/dashboard/service.py`
  - `app/modules/proxy/helpers.py`

## Default branch vs наш develop

- Статус: diverged, ahead 1, behind 179.
- Dashboard и UX: add usage tracking, failover routing, and dashboard support.
- Usage, квоты и тарификация: add usage tracking, failover routing, and dashboard support.
- Маршрутизация, sticky sessions и failover: add usage tracking, failover routing, and dashboard support.
- Совместимость с клиентами и API: add usage tracking, failover routing, and dashboard support.

## Дополнительные ветки в fork

- `kars`: ahead 6, behind 65. По коммитам видно: add usage tracking, failover routing, and dashboard support; 네트워크/타임아웃 에러 시 계정 deactivation 방지; add AGENTS-fork baseline.
  - Коммиты: add usage tracking, failover routing, and dashboard support; 네트워크/타임아웃 에러 시 계정 deactivation 방지; add AGENTS-fork baseline; update AGENTS-fork.md with v1.8.3 sync.
  - Основные зоны: `app/modules/proxy` (5), `app/modules/usage` (5), `app/modules/accounts` (4), `app/core/usage` (3).
- `support-spark`: ahead 1, behind 215. По коммитам видно: add usage tracking, failover routing, and dashboard support.
  - Коммиты: add usage tracking, failover routing, and dashboard support.
  - Основные зоны: `tests/integration` (7), `app/modules/proxy` (5), `app/modules/usage` (5), `app/core/usage` (3).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
