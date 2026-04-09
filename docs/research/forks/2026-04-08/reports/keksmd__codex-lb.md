# keksmd/codex-lb

- URL: https://github.com/keksmd/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-09T20:01:01Z`
- Последний push: `2026-03-13T15:26:49Z`
- Веток в форке: `2`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `2` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: support batch auth import/export and optional proxy key hardening.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 2, behind 110.
- Уникальные коммиты/темы:
  - support batch auth import/export and optional proxy key hardening
- Где менялся код:
  - `frontend/src`: 13 файлов
  - `frontend/accounts`: 10 файлов
  - `tests/unit`: 8 файлов
  - `app/core/clients`: 6 файлов
  - `openspec`: 6 файлов
  - `app/modules/accounts`: 5 файлов
- Ключевые изменённые файлы:
  - `.env.example`
  - `.gitignore`
  - `Jenkinsfile`
  - `README.md`
  - `app/cli.py`
  - `app/core/auth/__init__.py`
  - `app/core/auth/dependencies.py`
  - `app/core/auth/refresh.py`
  - `app/core/clients/codex_version.py`
  - `app/core/clients/http.py`
  - `app/core/clients/model_fetcher.py`
  - `app/core/clients/oauth.py`

## Default branch vs наш develop

- Статус: diverged, ahead 2, behind 74.
- Helm и деплой: support batch auth import/export and optional proxy key hardening.
- Usage, квоты и тарификация: support batch auth import/export and optional proxy key hardening.
- Аутентификация и доступ: support batch auth import/export and optional proxy key hardening.
- Маршрутизация, sticky sessions и failover: support batch auth import/export and optional proxy key hardening.

## Дополнительные ветки в fork

- `feature/batch-auth-import-export-proxy-key`: ahead 4, behind 110. По коммитам видно: support batch auth import/export and optional proxy key hardening; fix merge regressions in proxy/settings and add sqlite enum casing migration; fix migration heads and stabilize stream timeout override test.
  - Коммиты: support batch auth import/export and optional proxy key hardening; fix merge regressions in proxy/settings and add sqlite enum casing migration; fix migration heads and stabilize stream timeout override test.
  - Основные зоны: `frontend/src` (14), `frontend/accounts` (10), `tests/unit` (9), `app/core/clients` (6).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
