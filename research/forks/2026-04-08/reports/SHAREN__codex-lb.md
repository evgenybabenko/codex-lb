# SHAREN/codex-lb

- URL: https://github.com/SHAREN/codex-lb
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-30T12:06:33Z`
- Последний push: `2026-04-08T06:01:17Z`
- Веток в форке: `2`
- Оценка полезности: `High`

## Коротко по-человечески

- На default-ветке своих изменений поверх upstream нет, но внутри форка есть отдельные feature-ветки с уникальной работой.
- Рекомендация: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.

## Default branch vs upstream/main

- Статус: behind, ahead 0, behind 66.

## Default branch vs наш develop

- Статус: behind, ahead 0, behind 30.
- Всё уникальное в этом fork либо уже есть у нас, либо fork просто отстаёт от нашего develop.

## Дополнительные ветки в fork

- `codex/fix-account-deactivated-pool-removal`: ahead 4, behind 1. По коммитам видно: Fail closed on account_deactivated errors; Test websocket deactivation handshake classification; Fix test typing for usage client stubs.
  - Коммиты: Fail closed on account_deactivated errors; Test websocket deactivation handshake classification; Fix test typing for usage client stubs; Document fail-closed handling for deactivated accounts.
  - Основные зоны: `tests/unit` (5), `openspec` (3), `app/core/clients` (2), `app/core/balancer` (1).

## Итог

- Вердикт: `High`.
- Практический вывод: Есть содержательные backend/frontend/deploy-изменения, которые стоит разбирать на перенос по частям.
