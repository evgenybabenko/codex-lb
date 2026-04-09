## MODIFIED Requirements

### Requirement: Sticky-session mappings are typed and isolated by routing mode

The system SHALL keep a separate shared history of recent first-assignment
events for durable `codex_session` mappings so operators can spread new Codex
sessions across top-ranked accounts without altering existing sticky rows.

#### Scenario: New codex session assignment is recorded separately from sticky rows

- **WHEN** a new durable `codex_session` mapping is created
- **THEN** the system records the session key, sticky kind, account id, and
  assignment timestamp in the recent-assignment history store

#### Scenario: Spread history does not override an existing sticky mapping

- **WHEN** a later request arrives for a `codex_session` key that already has a
  stored sticky mapping
- **THEN** the service uses the stored sticky mapping directly
- **AND** it does not select a different account only because recent-assignment
  history would prefer another candidate
