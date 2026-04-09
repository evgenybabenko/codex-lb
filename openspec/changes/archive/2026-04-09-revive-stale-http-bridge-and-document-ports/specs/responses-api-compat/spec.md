## MODIFIED Requirements

### Requirement: HTTP /v1/responses preserves upstream websocket session continuity
When serving HTTP `/v1/responses`, the service MUST preserve upstream Responses websocket session continuity on a stable per-session bridge key instead of opening a brand new upstream session for every eligible request. The bridge key MUST use an explicit session/conversation header when present; otherwise it MUST use normalized `prompt_cache_key`, and when the client omits `prompt_cache_key` the service MUST derive a stable key from the same cache-affinity inputs already used for OpenAI prompt-cache routing. While bridged, the service MUST preserve the external HTTP/SSE contract, MUST continue request logging with `transport = "http"`, and MUST keep requests from different bridge keys isolated from one another.

#### Scenario: previous_response_id may revive a stale local bridge with saved reconnect state
- **WHEN** a client sends HTTP `/v1/responses` or `/backend-api/codex/responses` with `previous_response_id`
- **AND** the stable bridge key resolves to a stale local bridge session instead of a live one
- **AND** that stale local bridge still has resumable upstream or downstream turn-state
- **THEN** the service MAY reconnect that stale local bridge once before forwarding the request
- **AND** it MUST reuse the same stable bridge key instead of opening an unrelated fresh session

#### Scenario: previous_response_id still fails closed when stale bridge has no reconnect state
- **WHEN** a client sends HTTP `/v1/responses` or `/backend-api/codex/responses` with `previous_response_id`
- **AND** the stable bridge key resolves only to a stale local bridge session without resumable reconnect state
- **THEN** the service MUST fail the request with `previous_response_not_found`
- **AND** it MUST NOT create an unrelated fresh upstream session for that continuation
