## MODIFIED Requirements

### Requirement: Settings page

The Settings page SHALL include sections for: routing settings (sticky threads, weekly reset preference, full-weekly-capacity priority, prompt-cache affinity TTL), password management (setup/change/remove), TOTP management (setup/disable), API key auth toggle, API key management (table, create, edit, delete, regenerate), and sticky-session administration.

#### Scenario: Save routing settings

- **WHEN** a user updates sticky threads, weekly reset preference, the full-weekly-capacity priority toggle, or the prompt-cache affinity TTL
- **THEN** the app calls `PUT /api/settings` with the updated values

#### Scenario: Weekly reset preference exposes multiple modes

- **WHEN** a user opens the routing settings section
- **THEN** the weekly reset control renders a dropdown with `disabled`, `earlier_reset`, and `expiring_quota_priority`
- **AND** the selected value is loaded from `GET /api/settings`

#### Scenario: Weekly reset help explains the modes with examples

- **WHEN** a user hovers the weekly reset help affordance
- **THEN** the UI shows localized explanatory text for each weekly reset mode
- **AND** the help includes at least one concrete example that distinguishes `earlier_reset` from `expiring_quota_priority`

#### Scenario: Full weekly capacity priority defaults to on

- **WHEN** a user opens the routing settings section on a fresh install
- **THEN** the `prioritize_full_weekly_capacity` toggle is enabled by default
- **AND** the UI explains that fully unused weekly accounts are tried before partially spent weekly accounts
