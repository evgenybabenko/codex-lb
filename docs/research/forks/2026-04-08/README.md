# Исследование форков codex-lb

- Снимок: `2026-04-08` (`2026-04-08T11:33:59+00:00` UTC)
- Upstream: `Soju06/codex-lb@main`
- Наша база сравнения: `evgenybabenko/codex-lb@develop`
- Доступно через API: `101` форков
- GitHub сообщает общее число форков: `102`
- Если числа не совпадают, один или несколько форков могли быть удалены, скрыты или временно недоступны через API.

## Быстрые ссылки

- [Топ фич и что реально улучшит использование](./top-features.md)
- [Единый чек-лист: просмотрено / хотим / уже у нас](./feature-decision-checklist.md)
- [Чек-лист по форкам: проверен / берём / уже у нас](./fork-review-checklist.md)
- [База сравнения с нашим develop](./baseline-evgenybabenko-develop.md)

## Что важно в двух строках

- `High`: 43
- `Medium`: 8
- `Low`: 6
- `None`: 44

## Самые интересные кандидаты на перенос

- [pt1-png/codex-lb](./reports/pt1-png__codex-lb.md) — `High`; default ahead `13`; доп. веток `0`. add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility
- [drvova/codex-lb](./reports/drvova__codex-lb.md) — `High`; default ahead `11`; доп. веток `0`. align API schemas with official OpenAI wire format + add mitmdump capture tooling; resolve duplicate fields, hardcoded IDs, and add transcription schemas
- [evgenybabenko/codex-lb](./reports/our-fork__codex-lb.md) — `High`; default ahead `8`; доп. веток `18`. add workspace-aware account identity; cache and display workspace metadata
- [xirothedev/codex-lb](./reports/xirothedev__codex-lb.md) — `High`; default ahead `8`; доп. веток `1`. add self-service portal and viewer dashboard; add branch image workflow
- [CesarPetrescu/codex-lb](./reports/CesarPetrescu__codex-lb.md) — `High`; default ahead `7`; доп. веток `2`. enforce admin-token access and expand API key management; add full admin API usage runbook
- [swanwish/codex-lb](./reports/swanwish__codex-lb.md) — `High`; default ahead `7`; доп. веток `0`. add macOS executable build flow; use supported Intel macOS runners
- [brahmic/clb](./reports/brahmic__clb.md) — `High`; default ahead `5`; доп. веток `0`. fix docker building; Add bootstrap-only admin auth flow
- [screenreaders/codex-lb-pl](./reports/screenreaders__codex-lb-pl.md) — `High`; default ahead `5`; доп. веток `0`. translate web interfaces to Polish; translate new UI strings
- [dwnmf/codex-lb](./reports/dwnmf__codex-lb.md) — `High`; default ahead `4`; доп. веток `8`. migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions
- [ins1derft/codex-lb](./reports/ins1derft__codex-lb.md) — `High`; default ahead `4`; доп. веток `1`. add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP
- [josevelaz/codex-lb](./reports/josevelaz__codex-lb.md) — `High`; default ahead `4`; доп. веток `1`. add request visibility controls and option passthrough; move visibility toggle above empty state
- [kgskr/codex-lb](./reports/kgskr__codex-lb.md) — `High`; default ahead `4`; доп. веток `2`. Add platform fallback support; Fix platform fallback regressions and CI
- [L1st3r/codex-lb](./reports/L1st3r__codex-lb.md) — `High`; default ahead `2`; доп. веток `3`. add manual Windows startup regression workflow
- [keksmd/codex-lb](./reports/keksmd__codex-lb.md) — `High`; default ahead `2`; доп. веток `1`. support batch auth import/export and optional proxy key hardening
- [kargnas/codex-lb](./reports/kargnas__codex-lb.md) — `High`; default ahead `1`; доп. веток `2`. add usage tracking, failover routing, and dashboard support
- [svsairevanth/codex-lb](./reports/svsairevanth__codex-lb.md) — `High`; default ahead `1`; доп. веток `8`. add self-service API key usage endpoint + docs page
- [Daltonganger/codex-lb](./reports/Daltonganger__codex-lb.md) — `High`; default ahead `0`; доп. веток `5`. show remaining totals in usage donuts; align donut totals with visible slices
- [Felix201209/codex-lb](./reports/Felix201209__codex-lb.md) — `High`; default ahead `0`; доп. веток `6`. add unit tests for _coerce_number helper; add comprehensive unit tests for _coerce_number in proxy helpers
- [JKamsker/codex-lb](./reports/JKamsker__codex-lb.md) — `High`; default ahead `0`; доп. веток `1`. Refactor code structure for improved readability and maintainability; implement sticky session management and logging for proxy requests
- [JordxnBN/codex-lb](./reports/JordxnBN__codex-lb.md) — `High`; default ahead `0`; доп. веток `5`. normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat

## Полный каталог

| Fork | Rating | Default unique vs upstream | Доп. ветки | Отчёт | Ключевая мысль |
|---|---:|---:|---:|---|---|
| `pt1-png/codex-lb` | `High` | `13` | `0` | [report](./reports/pt1-png__codex-lb.md) | add cache mount IDs for Railway compatibility; remove cache mounts for Railway compatibility |
| `drvova/codex-lb` | `High` | `11` | `0` | [report](./reports/drvova__codex-lb.md) | align API schemas with official OpenAI wire format + add mitmdump capture tooling; resolve duplicate fields, hardcoded IDs, and add transcription schemas |
| `evgenybabenko/codex-lb` | `High` | `8` | `18` | [report](./reports/our-fork__codex-lb.md) | add workspace-aware account identity; cache and display workspace metadata |
| `xirothedev/codex-lb` | `High` | `8` | `1` | [report](./reports/xirothedev__codex-lb.md) | add self-service portal and viewer dashboard; add branch image workflow |
| `CesarPetrescu/codex-lb` | `High` | `7` | `2` | [report](./reports/CesarPetrescu__codex-lb.md) | enforce admin-token access and expand API key management; add full admin API usage runbook |
| `swanwish/codex-lb` | `High` | `7` | `0` | [report](./reports/swanwish__codex-lb.md) | add macOS executable build flow; use supported Intel macOS runners |
| `brahmic/clb` | `High` | `5` | `0` | [report](./reports/brahmic__clb.md) | fix docker building; Add bootstrap-only admin auth flow |
| `screenreaders/codex-lb-pl` | `High` | `5` | `0` | [report](./reports/screenreaders__codex-lb-pl.md) | translate web interfaces to Polish; translate new UI strings |
| `dwnmf/codex-lb` | `High` | `4` | `8` | [report](./reports/dwnmf__codex-lb.md) | migrate firewall backend and React dashboard page; fix handler coverage and migration head assertions |
| `ins1derft/codex-lb` | `High` | `4` | `1` | [report](./reports/ins1derft__codex-lb.md) | add RBAC users and owned API-key account scoping; add email OTP credential import via IMAP |
| `josevelaz/codex-lb` | `High` | `4` | `1` | [report](./reports/josevelaz__codex-lb.md) | add request visibility controls and option passthrough; move visibility toggle above empty state |
| `kgskr/codex-lb` | `High` | `4` | `2` | [report](./reports/kgskr__codex-lb.md) | Add platform fallback support; Fix platform fallback regressions and CI |
| `L1st3r/codex-lb` | `High` | `2` | `3` | [report](./reports/L1st3r__codex-lb.md) | add manual Windows startup regression workflow |
| `keksmd/codex-lb` | `High` | `2` | `1` | [report](./reports/keksmd__codex-lb.md) | support batch auth import/export and optional proxy key hardening |
| `kargnas/codex-lb` | `High` | `1` | `2` | [report](./reports/kargnas__codex-lb.md) | add usage tracking, failover routing, and dashboard support |
| `svsairevanth/codex-lb` | `High` | `1` | `8` | [report](./reports/svsairevanth__codex-lb.md) | add self-service API key usage endpoint + docs page |
| `Daltonganger/codex-lb` | `High` | `0` | `5` | [report](./reports/Daltonganger__codex-lb.md) | show remaining totals in usage donuts; align donut totals with visible slices |
| `Felix201209/codex-lb` | `High` | `0` | `6` | [report](./reports/Felix201209__codex-lb.md) | add unit tests for _coerce_number helper; add comprehensive unit tests for _coerce_number in proxy helpers |
| `JKamsker/codex-lb` | `High` | `0` | `1` | [report](./reports/JKamsker__codex-lb.md) | Refactor code structure for improved readability and maintainability; implement sticky session management and logging for proxy requests |
| `JordxnBN/codex-lb` | `High` | `0` | `5` | [report](./reports/JordxnBN__codex-lb.md) | normalize OpenCode payload compatibility and startup workflow; improve OpenCode usage and streaming compat |
| `MigiSenpai416/codex-lb` | `High` | `0` | `9` | [report](./reports/MigiSenpai416__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `Proguser/codex-lb` | `High` | `0` | `2` | [report](./reports/Proguser__codex-lb.md) | TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore |
| `Quack6765/codex-lb` | `High` | `0` | `3` | [report](./reports/Quack6765__codex-lb.md) | Fixed color; Added expand error option |
| `SHAREN/codex-lb` | `High` | `0` | `1` | [report](./reports/SHAREN__codex-lb.md) | Fail closed on account_deactivated errors; Test websocket deactivation handshake classification |
| `TCStreamGit/codex-lb` | `High` | `0` | `18` | [report](./reports/TCStreamGit__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `XavLimSG/codex-lb` | `High` | `0` | `9` | [report](./reports/XavLimSG__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `aaiyer/codex-lb` | `High` | `0` | `3` | [report](./reports/aaiyer__codex-lb.md) | handle disconnects and reset request ids; propagate body read failures |
| `azkore/codex-lb` | `High` | `0` | `5` | [report](./reports/azkore__codex-lb.md) | implement password-based authentication and API key support; complete react migration with bun-based workflow |
| `chrislaai/codex-lb` | `High` | `0` | `8` | [report](./reports/chrislaai__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `embogomolov/codex-lb` | `High` | `0` | `18` | [report](./reports/embogomolov__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `flokosti96/codex-lb` | `High` | `0` | `10` | [report](./reports/flokosti96__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `hhsw2015/codex-lb` | `High` | `0` | `3` | [report](./reports/hhsw2015__codex-lb.md) | add optional non-overwrite import mode; make sqlite email-unique migration fk-safe |
| `luiztrilha/codex-lb` | `High` | `0` | `17` | [report](./reports/luiztrilha__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `masterkain/codex-lb` | `High` | `0` | `9` | [report](./reports/masterkain__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `moonjoke001/codex-lb` | `High` | `0` | `8` | [report](./reports/moonjoke001__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `mws-weekend-projects/codex-lb` | `High` | `0` | `7` | [report](./reports/mws-weekend-projects__codex-lb.md) | add Windows OAuth help and runtime connect detection; surface API key name in dashboard logs |
| `pcy06/codex-lb` | `High` | `0` | `5` | [report](./reports/pcy06__codex-lb.md) | default sticky session setting to on; remove temporary validation artifacts |
| `physnowhere/codex-lb` | `High` | `0` | `8` | [report](./reports/physnowhere__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `rustyrayzor/codex-lb` | `High` | `0` | `8` | [report](./reports/rustyrayzor__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `s6663296/codex-lb` | `High` | `0` | `2` | [report](./reports/s6663296__codex-lb.md) | TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore |
| `salwinh/codex-lb` | `High` | `0` | `17` | [report](./reports/salwinh__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `sgnjfk/codex-lb` | `High` | `0` | `9` | [report](./reports/sgnjfk__codex-lb.md) | archive active changes; capture upstream additional_rate_limits fixture (synthetic, API returned 404) |
| `xCatalitY/codex-lb` | `High` | `0` | `5` | [report](./reports/xCatalitY__codex-lb.md) | TOTP AUTH FOR WEB PANEL; add SSL support to API server and update .gitignore |
| `vprv/codex-lb-ts` | `Medium` | `n/a` | `0` | [report](./reports/vprv__codex-lb-ts.md) | переписанная/оторванная история |
| `DOCaCola/codex-lb` | `Medium` | `2` | `0` | [report](./reports/DOCaCola__codex-lb.md) | Add usage tracking controls |
| `SolarWang233/codex-lb` | `Medium` | `1` | `0` | [report](./reports/SolarWang233__codex-lb.md) | harden upstream transport handling |
| `roro2239/codex-lb-_CN` | `Medium` | `1` | `0` | [report](./reports/roro2239__codex-lb-_CN.md) | complete i18n coverage |
| `JoshuaRileyDev/codex-lb` | `Medium` | `0` | `1` | [report](./reports/JoshuaRileyDev__codex-lb.md) | Harden HTTP bridge previous_response_id continuity recovery |
| `huzky-v/codex-lb` | `Medium` | `0` | `3` | [report](./reports/huzky-v__codex-lb.md) | add clean up existing openai step to opencode config |
| `mhughdo/codex-lb` | `Medium` | `0` | `1` | [report](./reports/mhughdo__codex-lb.md) | Add refreshable browser OAuth link |
| `minpeter/codex-lb` | `Medium` | `0` | `1` | [report](./reports/minpeter__codex-lb.md) | clarify quota labels and blur account titles; rename quota windows to explicit labels |
| `largelanguagemeowing/codex-lb` | `Low` | `3` | `0` | [report](./reports/largelanguagemeowing__codex-lb.md) | push :main Docker image to GHCR on main branch pushes; add workflow_dispatch and fix GHCR push condition |
| `Djeyff/codex-lb` | `Low` | `2` | `0` | [report](./reports/Djeyff__codex-lb.md) | create writable sqlite paths in containers; bind container to PORT env |
| `choi138/codex-lb` | `Low` | `2` | `0` | [report](./reports/choi138__codex-lb.md) | apply desktop nav pill classes to NavLink |
| `s6663290/codex-lb` | `Low` | `2` | `0` | [report](./reports/s6663290__codex-lb.md) | Update Dockerfile |
| `Daeroni/codex-lb` | `Low` | `0` | `1` | [report](./reports/Daeroni__codex-lb.md) | Use newer api that supports context caching, and update models for openclaw example |
| `ink-splatters/codex-lb` | `Low` | `0` | `2` | [report](./reports/ink-splatters__codex-lb.md) | build and publish GitHub release on pushing the tag; updated deps |
| `0xysh/codex-lb` | `None` | `0` | `0` | [report](./reports/0xysh__codex-lb.md) | нет своих изменений |
| `AXGZ21/codex-lb` | `None` | `0` | `0` | [report](./reports/AXGZ21__codex-lb.md) | нет своих изменений |
| `Aithie/codex-lb` | `None` | `0` | `0` | [report](./reports/Aithie__codex-lb.md) | нет своих изменений |
| `Brechtpd/codex-lb` | `None` | `0` | `0` | [report](./reports/Brechtpd__codex-lb.md) | нет своих изменений |
| `Chaitanysai/codex-lb` | `None` | `0` | `0` | [report](./reports/Chaitanysai__codex-lb.md) | нет своих изменений |
| `Coding-BR/codex-lb` | `None` | `0` | `0` | [report](./reports/Coding-BR__codex-lb.md) | нет своих изменений |
| `Darkshadow0409/codex-lb` | `None` | `0` | `0` | [report](./reports/Darkshadow0409__codex-lb.md) | нет своих изменений |
| `DrShutkot/codex-lb` | `None` | `0` | `0` | [report](./reports/DrShutkot__codex-lb.md) | нет своих изменений |
| `HamzaNIAU/codex-lb` | `None` | `0` | `0` | [report](./reports/HamzaNIAU__codex-lb.md) | нет своих изменений |
| `HighJ-GHJ/codex-lb` | `None` | `0` | `0` | [report](./reports/HighJ-GHJ__codex-lb.md) | нет своих изменений |
| `Jordan-Jarvis/codex-lb` | `None` | `0` | `0` | [report](./reports/Jordan-Jarvis__codex-lb.md) | нет своих изменений |
| `Kaiser1308/codex-lb` | `None` | `0` | `0` | [report](./reports/Kaiser1308__codex-lb.md) | нет своих изменений |
| `Khairul989/codex-lb` | `None` | `0` | `0` | [report](./reports/Khairul989__codex-lb.md) | нет своих изменений |
| `Neoplayer/codex-lb` | `None` | `0` | `0` | [report](./reports/Neoplayer__codex-lb.md) | нет своих изменений |
| `ViniciosLugli/codex-lb` | `None` | `0` | `0` | [report](./reports/ViniciosLugli__codex-lb.md) | нет своих изменений |
| `WangXiaoxiSecretBase/codex-lb` | `None` | `0` | `0` | [report](./reports/WangXiaoxiSecretBase__codex-lb.md) | нет своих изменений |
| `Yudoxx/codex-lb` | `None` | `0` | `0` | [report](./reports/Yudoxx__codex-lb.md) | нет своих изменений |
| `attacco/codex-lb` | `None` | `0` | `0` | [report](./reports/attacco__codex-lb.md) | нет своих изменений |
| `bluish/codex-lb` | `None` | `0` | `0` | [report](./reports/bluish__codex-lb.md) | нет своих изменений |
| `daunt/codex-lb` | `None` | `0` | `0` | [report](./reports/daunt__codex-lb.md) | нет своих изменений |
| `defin85/codex-lb` | `None` | `0` | `0` | [report](./reports/defin85__codex-lb.md) | нет своих изменений |
| `devsnaps/codex-lb` | `None` | `0` | `0` | [report](./reports/devsnaps__codex-lb.md) | нет своих изменений |
| `dictxwang/codex-lb` | `None` | `0` | `0` | [report](./reports/dictxwang__codex-lb.md) | нет своих изменений |
| `dumkawow/codex-lb` | `None` | `0` | `0` | [report](./reports/dumkawow__codex-lb.md) | нет своих изменений |
| `emicovi/codex-lb` | `None` | `0` | `0` | [report](./reports/emicovi__codex-lb.md) | нет своих изменений |
| `f1rs3bot/codex-lb` | `None` | `0` | `0` | [report](./reports/f1rs3bot__codex-lb.md) | нет своих изменений |
| `hanseo0507/codex-lb` | `None` | `0` | `0` | [report](./reports/hanseo0507__codex-lb.md) | нет своих изменений |
| `hoangpm96/codex-lb` | `None` | `0` | `0` | [report](./reports/hoangpm96__codex-lb.md) | нет своих изменений |
| `ivossos/codex-lb` | `None` | `0` | `0` | [report](./reports/ivossos__codex-lb.md) | нет своих изменений |
| `jalapeno777/codex-lb` | `None` | `0` | `0` | [report](./reports/jalapeno777__codex-lb.md) | нет своих изменений |
| `karinversan/codex-lb` | `None` | `0` | `0` | [report](./reports/karinversan__codex-lb.md) | нет своих изменений |
| `lightforgemedia/codex-lb` | `None` | `0` | `0` | [report](./reports/lightforgemedia__codex-lb.md) | нет своих изменений |
| `lijutsang/codex-lb` | `None` | `0` | `0` | [report](./reports/lijutsang__codex-lb.md) | нет своих изменений |
| `magicVspace/codex-lb` | `None` | `0` | `0` | [report](./reports/magicVspace__codex-lb.md) | нет своих изменений |
| `mohkg1017/codex-lb` | `None` | `0` | `0` | [report](./reports/mohkg1017__codex-lb.md) | нет своих изменений |
| `nguyenhoakhanh/codex-lb` | `None` | `0` | `0` | [report](./reports/nguyenhoakhanh__codex-lb.md) | нет своих изменений |
| `qq447411944/codex-lb` | `None` | `0` | `0` | [report](./reports/qq447411944__codex-lb.md) | нет своих изменений |
| `rzxczxc/codex-lb` | `None` | `0` | `0` | [report](./reports/rzxczxc__codex-lb.md) | нет своих изменений |
| `sevcator/codex-lb` | `None` | `0` | `0` | [report](./reports/sevcator__codex-lb.md) | нет своих изменений |
| `stephen-wd/codex-lb` | `None` | `0` | `0` | [report](./reports/stephen-wd__codex-lb.md) | нет своих изменений |
| `tangyao1993/codex-lb` | `None` | `0` | `0` | [report](./reports/tangyao1993__codex-lb.md) | нет своих изменений |
| `uvtechnologyins/codex-lb` | `None` | `0` | `0` | [report](./reports/uvtechnologyins__codex-lb.md) | нет своих изменений |
| `vpen66/codex-lb` | `None` | `0` | `0` | [report](./reports/vpen66__codex-lb.md) | нет своих изменений |
| `weixbao666/codex-lb` | `None` | `0` | `0` | [report](./reports/weixbao666__codex-lb.md) | нет своих изменений |
