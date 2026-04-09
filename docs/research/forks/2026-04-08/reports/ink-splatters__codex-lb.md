# ink-splatters/codex-lb

- URL: https://github.com/ink-splatters/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-17T17:53:30Z`
- Последний push: `2026-04-08T02:26:55Z`
- Веток в форке: `4`
- Оценка полезности: `Low`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть уникальные ветки или мелкие правки, но явной высокой ценности для вашей ветки не видно.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 19.

## Default branch vs наш develop

- Статус: diverged, ahead 23, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- `dev`: ahead 2, behind 19. По коммитам видно: build and publish GitHub release on pushing the tag; updated deps.
  - Коммиты: build and publish GitHub release on pushing the tag; updated deps.
  - Основные зоны: `.github/workflows` (1), `uv.lock` (1).
- `fix/package-config`: ahead 1, behind 82. По коммитам видно: package config/additional_quota_registry.json.
  - Коммиты: package config/additional_quota_registry.json.
  - Основные зоны: `pyproject.toml` (1).

## Итог

- Вердикт: `Low`.
- Практический вывод: Есть уникальные ветки или мелкие правки, но явной высокой ценности для вашей ветки не видно.
