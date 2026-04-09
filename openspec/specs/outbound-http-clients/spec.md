# Outbound HTTP Clients

## Purpose

Define how codex-lb performs outbound HTTP requests for upstream APIs and service metadata.

## Requirements

### Requirement: Shared outbound aiohttp clients honor environment proxy settings
The system MUST make the shared outbound HTTP `aiohttp` client used for OAuth,
metadata fetches, and standard upstream HTTP calls honor `HTTP_PROXY`,
`HTTPS_PROXY`, and `NO_PROXY` environment variables so operator-configured
proxy routing applies consistently to those flows.

#### Scenario: Service runs behind an operator-configured proxy
- **WHEN** codex-lb initializes the shared HTTP client or creates the Codex version GitHub client
- **THEN** the shared outbound HTTP `aiohttp.ClientSession` is created with environment proxy support enabled

### Requirement: Upstream websocket handshakes default to direct egress unless explicitly opted into env proxies
The system MUST default the dedicated websocket handshake client to direct
egress rather than environment proxy settings so upstream websocket transport
matches the native direct-connect behavior. Operators MUST be able to opt
websocket handshakes into env-proxy behavior via configuration.

#### Scenario: Default websocket handshake avoids env proxies
- **WHEN** codex-lb initializes the dedicated upstream websocket client with default settings
- **THEN** websocket handshakes are created without env-proxy support

#### Scenario: Operator enables websocket env-proxy support
- **WHEN** `CODEX_LB_UPSTREAM_WEBSOCKET_TRUST_ENV=true`
- **THEN** the dedicated upstream websocket client is created with environment proxy support enabled
