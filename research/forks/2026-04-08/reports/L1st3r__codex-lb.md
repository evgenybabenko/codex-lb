# L1st3r/codex-lb

- URL: https://github.com/L1st3r/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-01T15:04:02Z`
- Последний push: `2026-04-06T09:24:09Z`
- Веток в форке: `4`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `2` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add manual Windows startup regression workflow.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 2, behind 18.
- Уникальные коммиты/темы:
  - add manual Windows startup regression workflow

## Default branch vs наш develop

- Статус: diverged, ahead 26, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `feat/sticky_session_mass_delete`: ahead 14, behind 35. По коммитам видно: Added pytest-xdist so the test suite runs a lil faster; Created the bulk delete sticky sessions spec; add bulk deletion for sticky sessions.
  - Коммиты: Added pytest-xdist so the test suite runs a lil faster; Created the bulk delete sticky sessions spec; add bulk deletion for sticky sessions; batch bulk deletes and correct mock responses.
  - Основные зоны: `frontend/src` (9), `openspec` (5), `app/modules/sticky_sessions` (3), `app/modules/proxy` (1).
- `fix/windows-memory-monitor-startup`: ahead 4, behind 32. По коммитам видно: avoid Windows startup crash in memory monitor and add manual regression workflow; satisfy type checks for Windows memory monitor fallback; define Windows memory API ctypes signatures.
  - Коммиты: avoid Windows startup crash in memory monitor and add manual regression workflow; satisfy type checks for Windows memory monitor fallback; define Windows memory API ctypes signatures; rerun ci.
  - Основные зоны: `openspec` (4), `.github/workflows` (1), `app/core/resilience` (1), `tests/unit` (1).
- `fix/improve_log_error_details`: ahead 1, behind 40. По коммитам видно: Improve request log error details UX.
  - Коммиты: Improve request log error details UX.
  - Основные зоны: `openspec` (3), `frontend/src` (2), `frontend/dashboard` (2).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
