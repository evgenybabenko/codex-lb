## MODIFIED Requirements

### Requirement: Streaming Responses requests use a bounded retry budget
When a streaming `/v1/responses` request encounters upstream instability, the proxy MUST enforce a configurable total request budget across selection, token refresh, and upstream stream attempts. Each upstream stream attempt MUST clamp its connect timeout, idle timeout, and total request timeout to the remaining request budget. Upstream model-capacity failures such as `server_is_overloaded` or equivalent overload/capacity messages MUST be treated as recoverable account-health failures within that bounded retry policy.

#### Scenario: Upstream overload failover retries another account
- **WHEN** an upstream stream attempt fails with a temporary model-capacity signal such as `server_is_overloaded`
- **THEN** the proxy classifies the failure as recoverable
- **AND** it retries according to the bounded stream retry policy instead of immediately surfacing the first failure to the client

#### Scenario: Generic capacity message normalizes to overload recovery
- **WHEN** upstream returns a generic error code such as `server_error`
- **AND** the error message indicates temporary model capacity or overload
- **THEN** the proxy normalizes that failure to the overload recovery class
- **AND** it applies the same bounded failover behavior as explicit `server_is_overloaded`
