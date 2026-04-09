# xirothedev/codex-lb

- URL: https://github.com/xirothedev/codex-lb
- Снимок: `2026-04-08`
- Default branch: `master`
- Создан форк: `2026-03-15T08:28:13Z`
- Последний push: `2026-04-04T15:53:01Z`
- Веток в форке: `3`
- Оценка полезности: `High`

## Коротко по-человечески

- Default-ветка содержит `8` уникальных коммитов поверх upstream.
- По уникальным коммитам видно: add self-service portal and viewer dashboard; add branch image workflow; pause accounts on upstream 401.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: diverged, ahead 8, behind 67.
- Уникальные коммиты/темы:
  - add self-service portal and viewer dashboard
  - add branch image workflow
  - pause accounts on upstream 401
  - align merged 401 failover expectations
- Где менялся код:
  - `frontend/src`: 56 файлов
  - `openspec`: 50 файлов
  - `deploy/helm`: 34 файлов
  - `tests/integration`: 16 файлов
  - `app/db`: 15 файлов
  - `app/modules/proxy`: 8 файлов
- Ключевые изменённые файлы:
  - `.agents/settings.local.json`
  - `.agents/skills/codex-lb-upstream-sync-vps-deploy/SKILL.md`
  - `.all-contributorsrc`
  - `.env.example`
  - `.github/release-please-config.json`
  - `.github/release-please-manifest.json`
  - `.github/workflows/branch-docker-image.yml`
  - `.github/workflows/ci.yml`
  - `.github/workflows/release.yml`
  - `.gitignore`
  - `.sisyphus/evidence/task-1-backward-compat.txt`
  - `.sisyphus/evidence/task-1-model-tests.txt`

## Default branch vs наш develop

- Статус: diverged, ahead 8, behind 31.
- Helm и деплой: add self-service portal and viewer dashboard; add branch image workflow.
- Dashboard и UX: add self-service portal and viewer dashboard.
- Usage, квоты и тарификация: add self-service portal and viewer dashboard; add branch image workflow.
- Аутентификация и доступ: add self-service portal and viewer dashboard; add branch image workflow.

## Дополнительные ветки в fork

- `feat/previous-response-and-neon-postgres`: ahead 7, behind 105. По коммитам видно: persist response chains for previous_response_id; switch runtime to neon postgresql; normalize expiration datetimes.
  - Коммиты: persist response chains for previous_response_id; switch runtime to neon postgresql; normalize expiration datetimes; scope previous response snapshots.
  - Основные зоны: `openspec` (21), `app/db` (5), `app/modules/proxy` (5), `tests/integration` (4).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
