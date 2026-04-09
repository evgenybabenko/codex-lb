## 1. HTTP bridge recovery

- [x] 1.1 Revive stale HTTP bridge sessions for `previous_response_id` when local reconnect turn-state is still available
- [x] 1.2 Keep fail-closed behavior when no resumable local continuity state exists
- [x] 1.3 Add regression coverage for stale-bridge revival and the remaining fail-closed path

## 2. Port map docs

- [x] 2.1 Add an explicit main/sandbox/dev port map to the primary README
- [x] 2.2 Sync the same operating model into frontend architecture context docs

## 3. Validation

- [x] 3.1 Run focused bridge retry tests
- [x] 3.2 Run `npx -y @fission-ai/openspec validate --specs`
