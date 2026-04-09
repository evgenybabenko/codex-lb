## MODIFIED Requirements

### Requirement: Dashboard page

The Dashboard page SHALL display: summary metric cards (requests 7d, tokens, cost, error rate), primary and secondary usage donut charts with legends, account status cards grid, and a recent requests table with filtering and pagination.

#### Scenario: Dashboard usage donut titles are localized

- **WHEN** the Dashboard renders the primary and secondary remaining donuts
- **THEN** the donut titles and center labels MUST use the active UI locale instead of hardcoded English copy

#### Scenario: Dashboard usage donut center shows remaining versus capacity

- **WHEN** the Dashboard renders a usage donut center value
- **THEN** the center MUST display the aggregate remaining absolute quota and the total capacity for that window as a slash pair
- **AND** the pair MUST describe the same aggregate pool visualized by the donut slices

#### Scenario: Dashboard usage donut exposes time left until reset visually

- **WHEN** the Dashboard overview provides reset time and window length for a donut
- **THEN** the donut card MUST display a human-readable reset label
- **AND** the donut card MUST show a dynamic visual indicator for the remaining share of that quota window
