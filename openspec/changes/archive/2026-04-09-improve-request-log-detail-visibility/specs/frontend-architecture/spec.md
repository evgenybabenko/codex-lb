## ADDED Requirements

### Requirement: Request log detail visibility is operator-controlled

The Dashboard recent requests section SHALL let operators hide inline error text
so the table remains scannable during incident review. Hiding inline error text
MUST NOT remove access to the full request detail dialog, and the visibility
control MUST remain visible even when the current filters return zero rows.

#### Scenario: Inline error details can be collapsed

- **WHEN** the operator turns inline request error details off
- **THEN** each request row shows a compact inline error summary instead of the
  full error text
- **AND** the row still offers a visible action to open the full request detail
  dialog

#### Scenario: Visibility control stays visible for empty results

- **WHEN** the current request-log filters return zero rows
- **THEN** the request-log detail visibility control still renders above the
  empty state

### Requirement: Request log detail dialog shows request diagnostics

When an operator opens a request-log detail dialog, the dialog SHALL present
the request ID, model, total latency, first-token latency when available, and
the full error payload for that request.

#### Scenario: Detail dialog shows request timing data

- **WHEN** `/api/request-logs` returns a row with `latencyMs` and
  `latencyFirstTokenMs`
- **AND** the operator opens that row's detail dialog
- **THEN** the dialog shows the request ID, model, total latency, and
  first-token latency alongside the full error text
