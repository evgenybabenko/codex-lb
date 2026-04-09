# aaiyer/codex-lb

- URL: https://github.com/aaiyer/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-02-06T01:44:09Z`
- Последний push: `2026-03-25T19:42:20Z`
- Веток в форке: `4`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 73.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 37.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `integration`: ahead 40, behind 73. По коммитам видно: handle disconnects and reset request ids; propagate body read failures; durable http bridge ownership.
  - Коммиты: handle disconnects and reset request ids; propagate body read failures; durable http bridge ownership; address durable bridge regressions.
  - Основные зоны: `openspec` (7), `tests/unit` (6), `app/db` (4), `app/modules/proxy` (4).
- `feature/durable-http-bridge-ownership`: ahead 34, behind 73. По коммитам видно: durable http bridge ownership; address durable bridge regressions; harden durable http bridge leases.
  - Коммиты: durable http bridge ownership; address durable bridge regressions; harden durable http bridge leases; remove stale bridge inflight cleanup.
  - Основные зоны: `openspec` (7), `app/db` (4), `app/modules/proxy` (4), `tests/unit` (4).
- `fix/middleware-disconnect-request-id`: ahead 4, behind 73. По коммитам видно: handle disconnects and reset request ids; propagate body read failures; type middleware dispatch tests.
  - Коммиты: handle disconnects and reset request ids; propagate body read failures; type middleware dispatch tests; sort middleware test imports.
  - Основные зоны: `app/core/middleware` (2), `tests/unit` (2).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
