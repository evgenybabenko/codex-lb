# Daltonganger/codex-lb

- URL: https://github.com/Daltonganger/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-01T18:02:38Z`
- Последний push: `2026-04-08T10:15:05Z`
- Веток в форке: `6`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: identical, ahead 0, behind 0.

## Default branch vs наш develop

- Статус: diverged, ahead 42, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `fix/dashboard-remaining-total`: ahead 4, behind 40. По коммитам видно: show remaining totals in usage donuts; align donut totals with visible slices; tolerate constrained slice precision.
  - Коммиты: show remaining totals in usage donuts; align donut totals with visible slices; tolerate constrained slice precision; skip bogus weekly clamps.
  - Основные зоны: `frontend/dashboard` (3).
- `feat/api-key-usage-endpoint`: ahead 3, behind 54. По коммитам видно: add self-service v1 usage endpoint; fix ruff format violations.
  - Коммиты: add self-service v1 usage endpoint; fix ruff format violations.
  - Основные зоны: `openspec` (3), `app/modules/api_keys` (2), `app/modules/proxy` (2), `app/core/auth` (1).
- `feat/dashboard-proxy-auth`: ahead 3, behind 0. По коммитам видно: add dashboard proxy auth modes; preserve bootstrap state on 401; deflake load balancer concurrency timing.
  - Коммиты: add dashboard proxy auth modes; preserve bootstrap state on 401; deflake load balancer concurrency timing.
  - Основные зоны: `frontend/src` (11), `openspec` (3), `app/core/auth` (2), `app/core/middleware` (2).
- `fix/dashboard-donut-usage-breakdown`: ahead 2, behind 15. По коммитам видно: clarify donut usage breakdown.
  - Коммиты: clarify donut usage breakdown.
  - Основные зоны: `frontend/dashboard` (5), `frontend/src` (2), `donut-example-15-used-en-used-row.svg` (1).
- `fix/v1-usage-credit-overrides`: ahead 2, behind 40. По коммитам видно: add credit-based Codex override windows; keep aggregate credit limits trustworthy.
  - Коммиты: add credit-based Codex override windows; keep aggregate credit limits trustworthy.
  - Основные зоны: `frontend/src` (5), `app/db` (2), `app/modules/api_keys` (2), `app/modules/proxy` (2).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
