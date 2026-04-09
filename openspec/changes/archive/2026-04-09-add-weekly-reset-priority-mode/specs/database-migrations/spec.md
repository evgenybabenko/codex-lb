## ADDED Requirements

### Requirement: Weekly reset preference migration preserves current intent

Database upgrades that introduce the weekly reset preference enum MUST preserve the existing meaning of the old boolean setting.

#### Scenario: False backfills to disabled

- **WHEN** an upgraded installation has `prefer_earlier_reset_accounts = false`
- **THEN** the migrated weekly reset preference is stored as `disabled`

#### Scenario: True backfills to earlier-reset mode

- **WHEN** an upgraded installation has `prefer_earlier_reset_accounts = true`
- **THEN** the migrated weekly reset preference is stored as `earlier_reset`
