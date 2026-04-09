## MODIFIED Requirements

### Requirement: Live compatibility check output
The live compatibility check script MUST print the expected unsupported feature list and MUST write a results JSON file to `refs/openai-compat-live-results.json`.

#### Scenario: reference OpenAI SDK helper replays Codex turn-state
- **WHEN** the repo's OpenAI SDK reference helper receives an HTTP Responses response with `x-codex-turn-state`
- **THEN** it stores that turn-state on the helper instance
- **AND** a later `responses.create()` call on the same helper replays the stored `x-codex-turn-state` unless the caller explicitly overrides that header
- **AND** any newer `x-codex-turn-state` response header replaces the stored turn-state
