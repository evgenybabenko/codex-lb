# pt1-png/codex-lb

- URL: https://github.com/pt1-png/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-19T03:28:06Z`
- Последний push: `2026-04-08T07:17:12Z`
- Веток в форке: `1`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `13` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility; start device token polling immediately and auto-select device flow in containers.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 13, behind 200.
- Уникальные коммиты/темы:
  - add cache mount IDs for Railway compatibility
  - remove cache mounts for Railway compatibility
  - start device token polling immediately and auto-select device flow in containers
  - wait for volume mount before running migrations
- Где менялся код:
  - `app/modules/settings`: 4 файлов
  - `frontend/src`: 4 файлов
  - `app/db`: 3 файлов
  - `app/modules/request_logs`: 3 файлов
  - `frontend/dashboard`: 3 файлов
  - `scripts`: 2 файлов
- Ключевые изменённые файлы:
  - `Dockerfile`
  - `app/core/balancer/logic.py`
  - `app/core/content_filter.py`
  - `app/core/openai/message_coercion.py`
  - `app/db/alembic/versions/012_add_content_filter_settings.py`
  - `app/db/alembic/versions/013_add_request_log_text.py`
  - `app/db/models.py`
  - `app/modules/oauth/service.py`
  - `app/modules/proxy/service.py`
  - `app/modules/request_logs/mappers.py`
  - `app/modules/request_logs/repository.py`
  - `app/modules/request_logs/schemas.py`

## Default branch vs наш develop

- Статус: diverged, ahead 13, behind 164.
- Dashboard и UX: add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility.
- Usage, квоты и тарификация: add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility.
- Аутентификация и доступ: add contentFilterEnabled to test fixture in totp-settings test.
- Маршрутизация, sticky sessions и failover: add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility.

## Дополнительные ветки в fork

- Отдельных нетривиальных веток с уникальным кодом не обнаружено.

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
