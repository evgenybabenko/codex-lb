## 1. Helper

- [x] 1.1 Add a small stateful OpenAI SDK helper that stores `x-codex-turn-state` from raw Responses responses
- [x] 1.2 Replay the stored turn-state on later `responses.create()` calls while preserving caller-supplied extra headers

## 2. Tooling and docs

- [x] 2.1 Update `scripts/openai_compat_live_check.py` to use the helper for sequential `previous_response_id` coverage
- [x] 2.2 Update the Python SDK README guidance to show the turn-state persistence pattern

## 3. Validation

- [x] 3.1 Add focused tests for sync and async OpenAI SDK helper behavior
- [x] 3.2 Run targeted tests and `npx -y @fission-ai/openspec validate --specs`
