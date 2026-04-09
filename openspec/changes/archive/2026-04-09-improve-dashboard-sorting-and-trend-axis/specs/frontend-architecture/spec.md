## MODIFIED Requirements

### Requirement: Dashboard page

The Dashboard page SHALL display: summary metric cards (requests 7d, tokens, cost, error rate), primary and secondary usage donut charts with legends, account status cards grid, and a recent requests table with filtering and pagination.

#### Scenario: Dashboard account cards expose compact sorting controls

- **WHEN** the Dashboard renders account cards
- **THEN** it MUST expose compact sorting controls near the account-card section
- **AND** each control MUST be understandable via hover text without requiring a text-heavy toolbar

#### Scenario: Dashboard account cards can be sorted by operational priorities

- **WHEN** a user chooses a dashboard account-card sort mode
- **THEN** the card order MUST update without refetching data
- **AND** the available sort modes MUST include email, workspace, 5h remaining quota, 7d remaining quota, 5h reset timing, and 7d reset timing

#### Scenario: Dashboard KPI sparklines show date anchors on the X axis

- **WHEN** the Dashboard renders KPI sparkline charts
- **THEN** each sparkline MUST show readable date ticks directly on its X axis
- **AND** the ticks MUST provide time context for spikes without requiring a separate text-only period label
