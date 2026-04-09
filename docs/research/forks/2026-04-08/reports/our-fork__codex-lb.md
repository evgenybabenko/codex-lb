# evgenybabenko/codex-lb

- URL: https://github.com/evgenybabenko/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-04T08:48:44Z`
- Последний push: `2026-04-08T13:07:10Z`
- Веток в форке: `22`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `8` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add workspace-aware account identity; cache and display workspace metadata; document openspec cli and clean test harness.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 8, behind 35.
- Уникальные коммиты/темы:
  - add workspace-aware account identity
  - cache and display workspace metadata
  - document openspec cli and clean test harness
  - make docker compose portable
- Где менялся код:
  - `frontend/accounts`: 12 файлов
  - `app/modules/accounts`: 7 файлов
  - `frontend/dashboard`: 5 файлов
  - `openspec`: 5 файлов
  - `tests/unit`: 5 файлов
  - `frontend/src`: 3 файлов
- Ключевые изменённые файлы:
  - `.env.example`
  - `.gitignore`
  - `AGENTS.md`
  - `README.md`
  - `app/core/auth/__init__.py`
  - `app/core/auth/refresh.py`
  - `app/db/alembic/versions/20260403_120000_add_account_workspace_metadata.py`
  - `app/db/models.py`
  - `app/modules/accounts/auth_manager.py`
  - `app/modules/accounts/identity_metadata.py`
  - `app/modules/accounts/mappers.py`
  - `app/modules/accounts/openai_account_labels.py`

## Default branch vs наш develop

- Статус: diverged, ahead 9, behind 1.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Совместимость с клиентами и API: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `feat/additional-usage-depletion`: ahead 56, behind 143. По коммитам видно: archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404); add Pydantic models for additional rate limits.
  - Коммиты: archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404); add Pydantic models for additional rate limits; implement EWMA depletion engine.
  - Основные зоны: `frontend/dashboard` (9), `tests/unit` (8), `.sisyphus` (5), `app/modules/proxy` (5).
- `feature/upstream-websocket-transport-control`: ahead 19, behind 117. По коммитам видно: add upstream websocket transport control; address websocket review findings; stabilize theme storage tests.
  - Коммиты: add upstream websocket transport control; address websocket review findings; stabilize theme storage tests; strip websocket headers case-insensitively.
  - Основные зоны: `frontend/src` (9), `tests/integration` (5), `app/modules/settings` (4), `openspec` (4).
- `feat/totp`: ahead 11, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions; harden totp setup and replay protection.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `fix/sticky-session-affinity-operations`: ahead 8, behind 128. По коммитам видно: add sticky session controls and cleanup; address lint and migration checks; align migration chain and coverage.
  - Коммиты: add sticky session controls and cleanup; address lint and migration checks; align migration chain and coverage; make sticky session tests postgres-safe.
  - Основные зоны: `frontend/src` (20), `openspec` (10), `app/modules/sticky_sessions` (5), `app/modules/settings` (4).
- `codex/pr-61`: ahead 6, behind 220. По коммитам видно: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Коммиты: TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore; harden totp setup and sessions.
  - Основные зоны: `app` (5), `app/modules/dashboard_auth` (5), `app/db` (4), `app/modules/settings` (4).
- `codex/round-robin-routing-strategy`: ahead 5, behind 191. По коммитам видно: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates.
  - Коммиты: add routing strategy setting and true round-robin selection; isolate proxy service state per app; serialize round-robin selection updates; synchronize shared balancer runtime mutations.
  - Основные зоны: `frontend/src` (10), `app/modules/settings` (4), `app/core/balancer` (2), `app/db` (2).
- `feat/enforced-service-tier`: ahead 4, behind 58. По коммитам видно: add per-key enforced service tier; promote service_tier to explicit field on ResponsesCompactRequest; keep ApiKeyData service tier backward-compatible.
  - Коммиты: add per-key enforced service tier; promote service_tier to explicit field on ResponsesCompactRequest; keep ApiKeyData service tier backward-compatible; accept fast alias for enforced service tier.
  - Основные зоны: `tests/unit` (5), `app/modules/api_keys` (4), `app/modules/proxy` (3), `frontend/src` (3).
- `feature/service-tier-forwarding`: ahead 4, behind 164. По коммитам видно: support service_tier forwarding; support service tier pricing; show service tier in request logs.
  - Коммиты: support service_tier forwarding; support service tier pricing; show service tier in request logs; settle service tier usage correctly.
  - Основные зоны: `openspec` (9), `tests/unit` (5), `app/core/openai` (3), `app/core/usage` (3).
- `helm/enable-service-links-and-image-registry`: ahead 4, behind 35. По коммитам видно: disable service links and use fully qualified image names; auto-generate encryption key, grant schema permissions, auto-disable schema gate for external DB; prefer explicit encryption key over looked-up secret.
  - Коммиты: disable service links and use fully qualified image names; auto-generate encryption key, grant schema permissions, auto-disable schema gate for external DB; prefer explicit encryption key over looked-up secret; restore schema gate for external database install modes.
  - Основные зоны: `deploy/helm` (6).
- `helm/external-db-one-click`: ahead 3, behind 35. По коммитам видно: auto-generate encryption key, grant schema permissions, auto-disable schema gate for external DB; honor auth.encryptionKey before reusing existing secret; restore schema gate for external database install modes.
  - Коммиты: auto-generate encryption key, grant schema permissions, auto-disable schema gate for external DB; honor auth.encryptionKey before reusing existing secret; restore schema gate for external database install modes.
  - Основные зоны: `deploy/helm` (4).
- `helm/global-nodeselector`: ahead 3, behind 40. По коммитам видно: clarify ServiceMonitor and PrometheusRule defaults and alternatives; add db-init pre-install hook for external PostgreSQL; add global.nodeSelector propagated to all pod specs.
  - Коммиты: clarify ServiceMonitor and PrometheusRule defaults and alternatives; add db-init pre-install hook for external PostgreSQL; add global.nodeSelector propagated to all pod specs.
  - Основные зоны: `deploy/helm` (7).
- `helm/prod-deployment-docs`: ahead 3, behind 40. По коммитам видно: clarify ServiceMonitor and PrometheusRule defaults and alternatives; add db-init pre-install hook for external PostgreSQL; add production deployment guide for multi-replica Helm installs.
  - Коммиты: clarify ServiceMonitor and PrometheusRule defaults and alternatives; add db-init pre-install hook for external PostgreSQL; add production deployment guide for multi-replica Helm installs.
  - Основные зоны: `deploy/helm` (3).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
