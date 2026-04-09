## MODIFIED Requirements

### Requirement: Dashboard page

The Dashboard page SHALL display: summary metric cards (requests 7d, tokens, cost, error rate), primary and secondary usage donut charts with legends, account status cards grid, and a recent requests table with filtering and pagination.

#### Scenario: Dashboard data load

- **WHEN** the Dashboard page is rendered
- **THEN** the app fetches `/api/dashboard/overview` (accounts, summary, windows) and `/api/request-logs` (recent requests) in parallel, rendering all dashboard sections with the combined data

#### Scenario: Auto-refresh

- **WHEN** the Dashboard page is active
- **THEN** the dashboard overview and request logs are independently refetched at a regular interval (30 seconds)

#### Scenario: Request log filtering

- **WHEN** a user applies filters (search, timeframe, account, model, status) to the request logs table
- **THEN** only the request logs query refetches from `/api/request-logs` with the applied filter parameters; the dashboard overview is NOT refetched

#### Scenario: Request log pagination

- **WHEN** a user changes the page size or navigates to the next page
- **THEN** the request logs query refetches with updated offset/limit parameters and the response includes `total` count and `has_more` flag for pagination state

#### Scenario: Usage donut center value matches aggregate remaining pool

- **WHEN** the Dashboard renders a usage donut for a quota window
- **THEN** the value in the donut center MUST equal the aggregate remaining quota represented by the colored account slices for that same window
- **AND** the donut MUST NOT label total capacity as remaining quota

#### Scenario: Usage donut safe-line reflects aggregate pool depletion

- **WHEN** the Dashboard renders a safe-line marker for a usage donut
- **THEN** the marker MUST be derived from aggregate pool depletion for that window
- **AND** the marker MUST NOT be sourced only from the single riskiest account when the donut visualizes an aggregate account pool

#### Scenario: Usage donut safe-line remains visible in safe state

- **WHEN** the Dashboard has aggregate depletion data for a usage donut window
- **THEN** the safe-line marker MUST remain visible even when the aggregate risk level is `safe`
- **AND** the marker MUST still be positioned from the aggregate window's `safeUsagePercent`
- **AND** the marker visibility MUST NOT depend on whether the aggregate risk level has crossed warning thresholds
