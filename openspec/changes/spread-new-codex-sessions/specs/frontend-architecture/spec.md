## MODIFIED Requirements

### Requirement: Settings page

The Settings page SHALL include sections for: routing settings (sticky threads,
reset priority, prompt-cache affinity TTL, new Codex session spreading),
password management (setup/change/remove), TOTP management (setup/disable), API
key auth toggle, API key management (table, create, edit, delete, regenerate),
and sticky-session administration.

#### Scenario: Save new Codex session spread settings

- **WHEN** a user enables or disables new Codex session spreading, changes the
  spread time window, or changes the top-ranked account pool size
- **THEN** the app calls `PUT /api/settings` with the updated values

#### Scenario: New Codex session spread controls load current values

- **WHEN** a user opens the routing settings section
- **THEN** the spread toggle, time window, and pool size controls render the
  values returned by `GET /api/settings`
