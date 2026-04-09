## 1. Explicit turn-state recovery

- [x] 1.1 Allow bridge recreation for `previous_response_id` when `x-codex-turn-state` is explicit and can own the bridge key
- [x] 1.2 Preserve fail-closed behavior for `previous_response_id` when only prompt-cache/request-derived continuity exists

## 2. Live-session reconnect recovery

- [x] 2.1 Allow one reconnect retry for send-failure `previous_response_id` requests when a resumable turn-state is available
- [x] 2.2 Allow one reconnect retry for pre-created disconnect `previous_response_id` requests when a resumable turn-state is available

## 3. Validation

- [x] 3.1 Add regression coverage for turn-state alias loss recovery
- [x] 3.2 Add regression coverage for send-failure recovery
- [x] 3.3 Add regression coverage for pre-created disconnect recovery
- [x] 3.4 Validate OpenSpec artifacts and run targeted bridge tests
