# brahmic/clb

- URL: https://github.com/brahmic/clb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-28T19:15:50Z`
- Последний push: `2026-03-29T14:44:39Z`
- Веток в форке: `1`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `5` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: fix docker building; Add bootstrap-only admin auth flow; add xray proxy profiles and account routing.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 5, behind 69.
- Уникальные коммиты/темы:
  - fix docker building
  - Add bootstrap-only admin auth flow
  - add xray proxy profiles and account routing
  - Add dashboard chat workspace
- Где менялся код:
  - `frontend/src`: 34 файлов
  - `openspec`: 10 файлов
  - `frontend/accounts`: 9 файлов
  - `tests/integration`: 9 файлов
  - `app/modules/accounts`: 8 файлов
  - `tests/unit`: 7 файлов
- Ключевые изменённые файлы:
  - `Dockerfile`
  - `Dockerfile.image-worker`
  - `app/core/auth/dependencies.py`
  - `app/core/auth/refresh.py`
  - `app/core/clients/chatgpt_image_worker.py`
  - `app/core/clients/chatgpt_images.py`
  - `app/core/clients/proxy.py`
  - `app/core/clients/proxy_websocket.py`
  - `app/core/clients/usage.py`
  - `app/core/config/settings.py`
  - `app/core/openai/requests.py`
  - `app/db/alembic/versions/20260329_120000_add_proxy_profiles.py`

## Default branch vs наш develop

- Статус: diverged, ahead 5, behind 33.
- Helm и деплой: fix docker building; Add bootstrap-only admin auth flow.
- Dashboard и UX: Add dashboard chat workspace.
- Usage, квоты и тарификация: fix docker building; Add bootstrap-only admin auth flow.
- Аутентификация и доступ: Add bootstrap-only admin auth flow.

## Дополнительные ветки в fork

- Отдельных нетривиальных веток с уникальным кодом не обнаружено.

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
