# huzky-v/codex-lb

- URL: https://github.com/huzky-v/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-07T06:49:56Z`
- Последний push: `2026-04-08T09:17:17Z`
- Веток в форке: `4`
- Оценка полезности: `Medium`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть полезные идеи, но переносить стоит точечно после ручной валидации.

## Default branch vs upstream/main

- Статус: identical, ahead 0, behind 0.

## Default branch vs наш develop

- Статус: diverged, ahead 42, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `doc/update-opencode`: ahead 1, behind 0. По коммитам видно: add clean up existing openai step to opencode config.
  - Коммиты: add clean up existing openai step to opencode config.
  - Основные зоны: `README.md` (1).
- `feat/disable-remote-auth-flag`: ahead 1, behind 0. По коммитам видно: add a flag to disable remote auth.
  - Коммиты: add a flag to disable remote auth.
  - Основные зоны: `openspec` (4), `deploy/helm` (2), `.env.example` (1), `app/core/auth` (1).
- `test-pr-bot`: ahead 1, behind 15. По коммитам видно: test-pr-bot.
  - Коммиты: test-pr-bot.
  - Основные зоны: `frontend/src` (1).

## Итог

- Вердикт: `Medium`.
- Практический вывод: Есть полезные идеи, но переносить стоит точечно после ручной валидации.
