## MODIFIED Requirements

### Requirement: Codex backend session_id preserves account affinity

The service MUST continue treating backend Codex `session_id`,
`x-codex-session-id`, and `x-codex-conversation-id` as durable
`codex_session` affinity keys. When a durable mapping for that key does not yet
exist, the service MAY apply a dashboard-managed spread policy before storing
the first mapping. Once a durable mapping exists, later requests for that same
session key MUST keep using the existing mapping unless the normal sticky
reallocation rules already rebind it.

#### Scenario: New backend Codex sessions can spread across top-ranked accounts

- **WHEN** `/backend-api/codex/responses` receives several new non-empty
  `session_id` values within the configured spread window
- **AND** the new-session spread policy is enabled
- **THEN** the initial account selection avoids recently used accounts within
  the configured top-ranked pool when alternatives exist

#### Scenario: Existing backend Codex session keeps durable affinity

- **WHEN** `/backend-api/codex/responses` receives another request for a
  `session_id` that already has a durable sticky mapping
- **THEN** the service reuses the existing mapped account
- **AND** it does not re-run the new-session spread policy for that request
