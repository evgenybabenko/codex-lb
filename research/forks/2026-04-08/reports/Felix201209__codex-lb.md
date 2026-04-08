# Felix201209/codex-lb

- URL: https://github.com/Felix201209/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-07T10:30:04Z`
- Последний push: `2026-04-07T13:40:27Z`
- Веток в форке: `7`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 15.

## Default branch vs наш develop

- Статус: diverged, ahead 27, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `felixypz/test-coerce-number-unit-tests`: ahead 3, behind 15. По коммитам видно: add unit tests for _coerce_number helper; add comprehensive unit tests for _coerce_number in proxy helpers.
  - Коммиты: add unit tests for _coerce_number helper; add comprehensive unit tests for _coerce_number in proxy helpers.
  - Основные зоны: `tests/unit` (1).
- `felixypz/docs-select-account-docstring-20260407`: ahead 2, behind 15. По коммитам видно: add comprehensive docstrings to select_account in logic.py; Update app/core/balancer/logic.py.
  - Коммиты: add comprehensive docstrings to select_account in logic.py; Update app/core/balancer/logic.py.
  - Основные зоны: `app/core/balancer` (1).
- `felixypz/refactor-openai-compat-logging-2`: ahead 2, behind 19. По коммитам видно: tighten exception handling and use structured logging; Update scripts/openai_compat_live_check.py.
  - Коммиты: tighten exception handling and use structured logging; Update scripts/openai_compat_live_check.py.
  - Основные зоны: `scripts` (1).
- `felixypz/chore-settings-service-lint`: ahead 1, behind 15. По коммитам видно: wrap overlong settings mapping lines.
  - Коммиты: wrap overlong settings mapping lines.
  - Основные зоны: `app/modules/settings` (1).
- `felixypz/modernize-typing-usage-schemas-20260407`: ahead 1, behind 15. По коммитам видно: modernize type hinting and syntax in usage/schemas.py.
  - Коммиты: modernize type hinting and syntax in usage/schemas.py.
  - Основные зоны: `app/modules/usage` (1).
- `felixypz/request-id-test-coverage`: ahead 1, behind 15. По коммитам видно: add request id utility coverage.
  - Коммиты: add request id utility coverage.
  - Основные зоны: `app/core/utils` (1), `tests/unit` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
