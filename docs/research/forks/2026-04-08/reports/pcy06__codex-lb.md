# pcy06/codex-lb

- URL: https://github.com/pcy06/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-01-26T06:46:29Z`
- Последний push: `2026-04-01T06:29:16Z`
- Веток в форке: `6`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 60.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 24.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `copilot/enable-sticky-session`: ahead 7, behind 60. По коммитам видно: default sticky session setting to on; remove temporary validation artifacts; finalize sticky session default update.
  - Коммиты: default sticky session setting to on; remove temporary validation artifacts; finalize sticky session default update; restore uv lockfile.
  - Основные зоны: `app/db` (2), `app/modules/settings` (1), `openspec` (1), `tests/integration` (1).
- `chore/update-opencode-usage-docs`: ahead 1, behind 240. По коммитам видно: add opencode setup guide.
  - Коммиты: add opencode setup guide.
  - Основные зоны: `README.md` (1).
- `docs/update-opencode-setup-guide`: ahead 1, behind 240. По коммитам видно: add opencode setup guide.
  - Коммиты: add opencode setup guide.
  - Основные зоны: `README.md` (1).
- `feature/add-transcription-proxy-compat`: ahead 1, behind 178. По коммитам видно: add transcription compatibility routes.
  - Коммиты: add transcription compatibility routes.
  - Основные зоны: `openspec` (6), `app/modules/proxy` (2), `app/core/clients` (1), `app` (1).
- `fix/transcribe-upstream-headers`: ahead 1, behind 110. По коммитам видно: match Codex CLI header fingerprint for transcribe upstream requests.
  - Коммиты: match Codex CLI header fingerprint for transcribe upstream requests.
  - Основные зоны: `app/core/clients` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
