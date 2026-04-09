# drvova/codex-lb

- URL: https://github.com/drvova/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-27T22:27:19Z`
- Последний push: `2026-04-04T22:37:10Z`
- Веток в форке: `1`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `11` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: align API schemas with official OpenAI wire format + add mitmdump capture tooling; resolve duplicate fields, hardcoded IDs, and add transcription schemas; validate schemas against real OpenAI wire format responses.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 11, behind 32.
- Уникальные коммиты/темы:
  - align API schemas with official OpenAI wire format + add mitmdump capture tooling
  - resolve duplicate fields, hardcoded IDs, and add transcription schemas
  - validate schemas against real OpenAI wire format responses
  - auto-detect writable database directory for Zeabur compatibility
- Где менялся код:
  - `frontend/src`: 9 файлов
  - `tools`: 7 файлов
  - `app/modules/settings`: 4 файлов
  - `app/core/openai`: 3 файлов
  - `app`: 2 файлов
  - `app/db`: 2 файлов
- Ключевые изменённые файлы:
  - `.env.example`
  - `Dockerfile`
  - `app/cli.py`
  - `app/core/config/settings.py`
  - `app/core/openai/chat_responses.py`
  - `app/core/openai/models.py`
  - `app/core/openai/transcription.py`
  - `app/core/tunnel.py`
  - `app/db/alembic/versions/20260404_000000_add_network_proxy_settings.py`
  - `app/db/models.py`
  - `app/main.py`
  - `app/modules/oauth/service.py`

## Default branch vs наш develop

- Статус: diverged, ahead 21, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- Отдельных нетривиальных веток с уникальным кодом не обнаружено.

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
