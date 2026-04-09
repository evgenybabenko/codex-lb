## MODIFIED Requirements

### Requirement: Settings 캐시 활용

The proxy request path MUST read dashboard settings through `SettingsCache` instead of opening a separate DB session.

#### Scenario: Proxy requests use the settings cache

- **WHEN** a stream or compact proxy request needs settings such as `sticky_threads_enabled` or `weekly_reset_preference`
- **THEN** the system reads them from `SettingsCache` and does not create a separate DB session

### Requirement: Weekly reset preference modes influence account selection

The request-path account selector MUST support three weekly reset preference modes: `disabled`, `earlier_reset`, and `expiring_quota_priority`.

### Requirement: Fully unused weekly accounts can be prioritized first

The request-path account selector MUST support a `prioritize_full_weekly_capacity` setting that is enabled by default.

#### Scenario: Default setting prefers fully unused weekly accounts

- **WHEN** `prioritize_full_weekly_capacity` is enabled
- **AND** one or more eligible accounts still have `100%` of their weekly quota remaining
- **THEN** account selection narrows the candidate pool to those fully unused weekly accounts before applying the base routing strategy or weekly reset preference

#### Scenario: Disabled setting falls back to normal pool ordering

- **WHEN** `prioritize_full_weekly_capacity` is disabled
- **THEN** account selection considers fully unused and partially used weekly accounts together according to the active routing strategy and weekly reset preference

#### Scenario: Earlier-reset mode keeps reset time as the primary weekly signal

- **WHEN** weekly reset preference is `earlier_reset`
- **THEN** account selection prefers candidates whose weekly quota resets earlier before applying the base routing strategy within that preferred set

#### Scenario: Expiring-quota mode favors valuable weekly quota that expires soon

- **WHEN** weekly reset preference is `expiring_quota_priority`
- **THEN** the selector computes each candidate's weekly reset priority from remaining weekly capacity and time until weekly reset
- **AND** the time component decays exponentially with a 12-hour half-life
- **AND** candidates with higher weekly reset priority are preferred over candidates with lower priority
