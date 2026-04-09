## MODIFIED Requirements

### Requirement: HTTP /v1/responses preserves upstream websocket session continuity
When serving HTTP `/v1/responses`, the service MUST preserve upstream Responses websocket session continuity on a stable per-session bridge key instead of opening a brand new upstream session for every eligible request. The bridge key MUST use an explicit session/conversation header when present; otherwise it MUST use normalized `prompt_cache_key`, and when the client omits `prompt_cache_key` the service MUST derive a stable key from the same cache-affinity inputs already used for OpenAI prompt-cache routing. While bridged, the service MUST preserve the external HTTP/SSE contract, MUST continue request logging with `transport = "http"`, and MUST keep requests from different bridge keys isolated from one another.

#### Scenario: explicit turn-state can recover previous_response_id after local alias loss
- **WHEN** a client sends HTTP `/v1/responses` or `/backend-api/codex/responses` with `previous_response_id`
- **AND** the request includes an explicit `x-codex-turn-state`
- **AND** there is no matching live local bridge session for that turn-state alias
- **THEN** the service MAY recreate the local bridge keyed by that turn-state
- **AND** it MUST reconnect upstream with the same `x-codex-turn-state` before forwarding the request

#### Scenario: live bridge reconnect may recover previous_response_id before response.created
- **WHEN** a bridged HTTP request with `previous_response_id` loses its live upstream connection before upstream creates the next response
- **AND** the bridge session already has a resumable upstream or downstream turn-state
- **THEN** the service MAY reconnect upstream once using that turn-state
- **AND** it MUST resend the same request at most once before surfacing `previous_response_not_found`

#### Scenario: previous_response_id still fails closed without explicit turn-state continuity
- **WHEN** a client sends HTTP `/v1/responses` or `/backend-api/codex/responses` with `previous_response_id`
- **AND** there is no matching live bridged upstream websocket session
- **AND** the request does not include an explicit resumable `x-codex-turn-state`
- **THEN** the service MUST fail the request without opening a fresh upstream session
- **AND** it MUST return `previous_response_not_found` on `previous_response_id`
