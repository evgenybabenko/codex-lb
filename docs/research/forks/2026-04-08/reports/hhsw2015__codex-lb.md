# hhsw2015/codex-lb

- URL: https://github.com/hhsw2015/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-01-22T12:46:32Z`
- Последний push: `2026-03-29T07:13:35Z`
- Веток в форке: `4`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 69.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 33.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `fix/import-without-overwrite-toggle`: ahead 17, behind 197. По коммитам видно: add optional non-overwrite import mode; make sqlite email-unique migration fk-safe; render duplicate-email quota legends separately.
  - Коммиты: add optional non-overwrite import mode; make sqlite email-unique migration fk-safe; render duplicate-email quota legends separately; align dashboard setting default with migration schema.
  - Основные зоны: `frontend/src` (10), `openspec` (6), `tests/integration` (6), `frontend/accounts` (5).
- `feature/v1-chat-bridge`: ahead 9, behind 233. По коммитам видно: ignore worktrees dir; add v1 chat and models endpoints; fix import order.
  - Коммиты: ignore worktrees dir; add v1 chat and models endpoints; fix import order; allow tool_choice objects.
  - Основные зоны: `app/core/openai` (6), `tests/unit` (4), `tests/integration` (2), `.gitignore` (1).
- `feature/opencode-v1-compat`: ahead 5, behind 243. По коммитам видно: add v1 responses compatibility for OpenCode; respect root_path in v1 rewrite; tighten message coercion typing.
  - Коммиты: add v1 responses compatibility for OpenCode; respect root_path in v1 rewrite; tighten message coercion typing; split v1 routes and restore validation.
  - Основные зоны: `tests/unit` (3), `app/core/openai` (2), `app/modules/proxy` (2), `README.md` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
