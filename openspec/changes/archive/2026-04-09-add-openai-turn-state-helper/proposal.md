## Why

`codex-lb` now returns `x-codex-turn-state` on HTTP Responses routes and can recover `previous_response_id` more reliably when clients replay that header. The official OpenAI Python SDK does not persist or replay arbitrary response headers by itself, so sequential SDK calls still lose that stronger continuity unless the caller adds its own stateful wrapper.

This repository does not contain the external Codex/OpenCode client implementations, but it does ship compatibility tooling and Python SDK examples. We should provide a tested reference helper there so users have a concrete client-side pattern and our own live-check harness exercises the stronger continuity path.

## What Changes

- add a small stateful OpenAI SDK wrapper that captures `x-codex-turn-state` from raw Responses HTTP responses and replays it on later `responses.create()` calls
- use that helper in the OpenAI compatibility live-check for sequential `previous_response_id` calls
- document the pattern in the Python SDK README section
- add focused tests for sync and async helper behavior

## Impact

- `compatibility-tooling`: the repo provides a reference OpenAI SDK helper for replaying Codex turn-state across sequential Responses calls
- `responses-api-compat`: no server behavior change; this improves client interoperability with the already-shipped turn-state headers
