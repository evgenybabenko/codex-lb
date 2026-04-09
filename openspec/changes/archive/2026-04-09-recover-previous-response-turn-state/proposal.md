## Why

`previous_response_id` currently fails closed whenever HTTP bridge continuity is unavailable locally, even when the client provides an explicit `x-codex-turn-state` that can re-establish upstream continuity. The bridge also refuses to retry `previous_response_id` requests after a send/pre-created disconnect even when the live session already has a resumable upstream turn-state.

That makes some continuation failures recover only after a manual retry, despite the proxy already having enough continuity state to recover safely.

## What Changes

- allow HTTP bridge recreation for `previous_response_id` when the request includes an explicit `x-codex-turn-state`
- allow one controlled reconnect-and-resend retry for `previous_response_id` when a live bridge session already has a resumable turn-state
- keep fail-closed behavior for continuity loss when only weaker prompt-cache continuity is available
- add regression coverage for turn-state alias loss and disconnect recovery paths

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responses-api-compat`: HTTP `previous_response_id` recovery may use explicit turn-state continuity and live-session reconnect state instead of failing immediately

## Impact

- Code: `app/modules/proxy/service.py`
- Tests: `tests/integration/test_http_responses_bridge.py`
- Specs: `openspec/specs/responses-api-compat/spec.md`
