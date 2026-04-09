# swanwish/codex-lb

- URL: https://github.com/swanwish/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-04-04T00:11:08Z`
- Последний push: `2026-04-08T07:50:18Z`
- Веток в форке: `1`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `7` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add macOS executable build flow; use supported Intel macOS runners; add macOS PKG installer flow.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: ahead, ahead 7, behind 0.
- Уникальные коммиты/темы:
  - add macOS executable build flow
  - use supported Intel macOS runners
  - add macOS PKG installer flow
  - sign embedded macOS binaries during build
- Где менялся код:
  - `openspec`: 6 файлов
  - `packaging`: 4 файлов
  - `.github/workflows`: 2 файлов
  - `frontend/src`: 2 файлов
  - `tests/unit`: 2 файлов
  - `README.md`: 1 файлов
- Ключевые изменённые файлы:
  - `.github/workflows/macos-package.yml`
  - `.github/workflows/release.yml`
  - `README.md`
  - `app/cli.py`
  - `app/core/config/settings.py`
  - `frontend/src/features/accounts/components/account-usage-panel.tsx`
  - `frontend/src/utils/formatters.test.ts`
  - `frontend/src/utils/formatters.ts`
  - `openspec/changes/add-macos-packaging/.openspec.yaml`
  - `openspec/changes/add-macos-packaging/context.md`
  - `openspec/changes/add-macos-packaging/proposal.md`
  - `openspec/changes/add-macos-packaging/specs/desktop-packaging/spec.md`

## Default branch vs наш develop

- Статус: diverged, ahead 49, behind 6.
- Helm и деплой: external DB secrets guide, ServiceMonitor alternatives, production deployment guide; configurable service, db-init hook, global nodeSelector, enhanced tests; one-click external database setup improvements.
- Dashboard и UX: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Usage, квоты и тарификация: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).
- Аутентификация и доступ: lowercase Trivy image-ref and bump all actions to latest; use exact tag v8.0.0 for setup-uv (no v8 major tag exists).

## Дополнительные ветки в fork

- Отдельных нетривиальных веток с уникальным кодом не обнаружено.

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
