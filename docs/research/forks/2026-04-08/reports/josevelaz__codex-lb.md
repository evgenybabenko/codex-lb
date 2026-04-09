# josevelaz/codex-lb

- URL: https://github.com/josevelaz/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-18T22:53:43Z`
- Последний push: `2026-04-03T13:06:36Z`
- Веток в форке: `2`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `4` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add request visibility controls and option passthrough; move visibility toggle above empty state.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 4, behind 36.
- Уникальные коммиты/темы:
  - add request visibility controls and option passthrough
  - move visibility toggle above empty state
- Где менялся код:
  - `frontend/src`: 11 файлов
  - `frontend/dashboard`: 8 файлов
  - `app/modules/request_logs`: 6 файлов
  - `app/modules/settings`: 4 файлов
  - `tests/unit`: 4 файлов
  - `app/core/openai`: 3 файлов
- Ключевые изменённые файлы:
  - `README.md`
  - `app/core/openai/chat_requests.py`
  - `app/core/openai/requests.py`
  - `app/core/openai/v1_requests.py`
  - `app/db/alembic/versions/20260402_210000_add_request_log_visibility_blob.py`
  - `app/db/alembic/versions/20260403_020000_add_request_visibility_policy_to_dashboard_settings.py`
  - `app/db/models.py`
  - `app/modules/proxy/service.py`
  - `app/modules/request_logs/api.py`
  - `app/modules/request_logs/mappers.py`
  - `app/modules/request_logs/repository.py`
  - `app/modules/request_logs/schemas.py`

## Default branch vs наш develop

- Статус: diverged, ahead 10, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Маршрутизация, sticky sessions и failover: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `feat/request-visibility-ui-toggle`: ahead 3, behind 36. По коммитам видно: add request visibility controls and option passthrough; move visibility toggle above empty state.
  - Коммиты: add request visibility controls and option passthrough; move visibility toggle above empty state.
  - Основные зоны: `frontend/src` (11), `frontend/dashboard` (8), `app/modules/request_logs` (6), `app/modules/settings` (4).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
