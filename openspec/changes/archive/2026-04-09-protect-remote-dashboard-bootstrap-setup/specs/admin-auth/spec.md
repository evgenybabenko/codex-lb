### Requirement: Remote first-time password setup requires bootstrap token

The system SHALL support optional environment variable `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN` for protecting remote first-time dashboard password setup.

When no dashboard password is configured, a bootstrap token is configured, and the request is determined to be remote, `POST /api/dashboard-auth/password/setup` MUST require request body field `bootstrapToken` to exactly match the configured token.

When the same request is local (loopback / localhost), first-time password setup MUST remain allowed without a bootstrap token.

#### Scenario: Remote first-time setup rejected without bootstrap token

- **GIVEN** `password_hash` is NULL
- **AND** `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN="secret-bootstrap"`
- **AND** the request is remote
- **WHEN** client submits `POST /api/dashboard-auth/password/setup` with `{ "password": "password123" }`
- **THEN** the system returns `400` with error code `bootstrap_token_required`

#### Scenario: Remote first-time setup rejected with invalid bootstrap token

- **GIVEN** `password_hash` is NULL
- **AND** `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN="secret-bootstrap"`
- **AND** the request is remote
- **WHEN** client submits `POST /api/dashboard-auth/password/setup` with `{ "password": "password123", "bootstrapToken": "wrong" }`
- **THEN** the system returns `400` with error code `invalid_bootstrap_token`

#### Scenario: Remote first-time setup succeeds with valid bootstrap token

- **GIVEN** `password_hash` is NULL
- **AND** `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN="secret-bootstrap"`
- **AND** the request is remote
- **WHEN** client submits `POST /api/dashboard-auth/password/setup` with `{ "password": "password123", "bootstrapToken": "secret-bootstrap" }`
- **THEN** the system stores the password hash and returns a valid dashboard session response

#### Scenario: Local first-time setup remains token-free

- **GIVEN** `password_hash` is NULL
- **AND** `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN="secret-bootstrap"`
- **AND** the request is local
- **WHEN** client submits `POST /api/dashboard-auth/password/setup` with `{ "password": "password123" }`
- **THEN** the system stores the password hash without requiring `bootstrapToken`

### Requirement: Session endpoint reports bootstrap token requirement

The session endpoint SHALL expose whether the current client must provide a bootstrap token for first-time password setup.

`GET /api/dashboard-auth/session` MUST include boolean `bootstrapTokenRequired`.

When a password is already configured, or when no bootstrap token is configured, or when the request is local, `bootstrapTokenRequired` MUST be `false`.

#### Scenario: Remote client sees bootstrap token requirement before first setup

- **GIVEN** `password_hash` is NULL
- **AND** `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN="secret-bootstrap"`
- **AND** the request is remote
- **WHEN** client calls `GET /api/dashboard-auth/session`
- **THEN** the response contains `{ "passwordRequired": false, "authenticated": true, "bootstrapTokenRequired": true, ... }`
