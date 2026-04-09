### Requirement: Password setup UI supports remote bootstrap token

The settings-page password setup dialog SHALL render a bootstrap-token input only when `GET /api/dashboard-auth/session` reports `bootstrapTokenRequired: true`.

When rendered, the form SHALL submit the token as `bootstrapToken` together with the new password to `POST /api/dashboard-auth/password/setup`.

#### Scenario: Local setup dialog hides bootstrap token field

- **WHEN** the password setup dialog is opened and auth session state reports `bootstrapTokenRequired: false`
- **THEN** the dialog shows only the password field

#### Scenario: Remote setup dialog includes bootstrap token field

- **WHEN** the password setup dialog is opened and auth session state reports `bootstrapTokenRequired: true`
- **THEN** the dialog shows both the password field and the bootstrap token field

#### Scenario: Remote setup submits bootstrap token

- **WHEN** the setup dialog is submitted with password and bootstrap token
- **THEN** the frontend calls `POST /api/dashboard-auth/password/setup` with both fields
