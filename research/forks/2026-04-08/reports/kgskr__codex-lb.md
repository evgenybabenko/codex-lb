# kgskr/codex-lb

- URL: https://github.com/kgskr/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-07T10:16:53Z`
- Последний push: `2026-04-08T08:45:05Z`
- Веток в форке: `3`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `4` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: Add platform fallback support; Fix platform fallback regressions and CI; Bump version to 1.12.1 and simplify release workflow.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: ahead, ahead 4, behind 0.
- Уникальные коммиты/темы:
  - Add platform fallback support
  - Fix platform fallback regressions and CI
  - Bump version to 1.12.1 and simplify release workflow
- Где менялся код:
  - `frontend/accounts`: 18 файлов
  - `openspec`: 13 файлов
  - `tests/integration`: 13 файлов
  - `frontend/src`: 12 файлов
  - `tests/unit`: 9 файлов
  - `frontend/dashboard`: 8 файлов
- Ключевые изменённые файлы:
  - `.github/release-please-config.json`
  - `.github/workflows/ci.yml`
  - `.github/workflows/release-please.yml`
  - `.github/workflows/release.yml`
  - `app/__init__.py`
  - `app/core/clients/openai_platform.py`
  - `app/core/clients/proxy.py`
  - `app/core/runtime_logging.py`
  - `app/db/alembic/versions/20260407_020000_add_openai_platform_identities.py`
  - `app/db/alembic/versions/20260407_030000_rekey_sticky_sessions_by_provider.py`
  - `app/db/alembic/versions/20260408_020000_merge_platform_fallback_and_import_heads.py`
  - `app/db/alembic/versions/20260408_030000_align_platform_identity_status_enum.py`

## Default branch vs наш develop

- Статус: diverged, ahead 46, behind 7.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `codex/frontend-korean-ui`: ahead 3, behind 0. По коммитам видно: Add platform fallback support; Fix platform fallback regressions and CI; localize frontend UI to Korean.
  - Коммиты: Add platform fallback support; Fix platform fallback regressions and CI; localize frontend UI to Korean.
  - Основные зоны: `frontend/src` (56), `frontend/accounts` (24), `frontend/dashboard` (16), `openspec` (13).
- `codex/platform-fallback-wip`: ahead 2, behind 0. По коммитам видно: Add platform fallback support; Fix platform fallback regressions and CI.
  - Коммиты: Add platform fallback support; Fix platform fallback regressions and CI.
  - Основные зоны: `frontend/accounts` (18), `openspec` (13), `tests/integration` (13), `frontend/src` (12).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
