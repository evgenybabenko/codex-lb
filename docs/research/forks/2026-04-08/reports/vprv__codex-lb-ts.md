# vprv/codex-lb-ts

- URL: https://github.com/vprv/codex-lb-ts
- Снимок: `2026-04-08`
- Default branch: `main`
- Создан форк: `2026-03-11T14:11:15Z`
- Последний push: `2026-03-11T21:50:05Z`
- Веток в форке: `1`
- Оценка полезности: `Medium`

## Коротко по-человечески

- Это не просто слегка изменённый fork: история оторвана от upstream настолько, что GitHub не может построить обычный compare.
- По названию и состоянию похоже на отдельную TypeScript-реализацию/порт, а не на обычный patch-set поверх Python-версии.
- README подтверждает, что проект живёт как отдельная линия развития:

```md
# codex-lm-ts

TypeScript port of a Codex/ChatGPT account load balancer with a dashboard, SQLite storage, and OAuth-backed account onboarding.

This repo currently provides:

- Fastify backend on `2455`
- React dashboard on `5173`
- OAuth callback listener on `1455`
- SQLite persistence for accounts, settings, and request logs
- OAuth account storage with refresh-token based renewal
```
- Рекомендация: Похоже на отдельную реализацию или серьёзный rewrite. Полезно как источник идей, но не как прямой cherry-pick.

## Default branch vs upstream/main

- Статус: история разошлась настолько, что GitHub не видит общего предка.

## Default branch vs наш develop

- Статус: история разошлась настолько, что GitHub не видит общего предка.

## Дополнительные ветки в fork

- Отдельных нетривиальных веток с уникальным кодом не обнаружено.

## Итог

- Вердикт: `Medium`.
- Практический вывод: Похоже на отдельную реализацию или серьёзный rewrite. Полезно как источник идей, но не как прямой cherry-pick.
