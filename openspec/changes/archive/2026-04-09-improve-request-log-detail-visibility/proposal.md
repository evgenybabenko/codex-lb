## Why

The dashboard already shows recent request logs, but dense inline error text
quickly turns the table into noise. Operators need a compact mode that keeps
rows scannable while still preserving a fast path to the full failure details.

The existing request-log API already records useful diagnostics such as request
ID and latency, but the current UI does not surface them together in a focused
detail view. That makes troubleshooting slower than it needs to be.

## What Changes

- Add a dashboard control to hide inline request error text without removing
  access to full request details.
- Keep that visibility control visible even when the current request-log filter
  set returns zero rows.
- Expand the request-log detail dialog to show request ID, model, total
  latency, first-token latency, and the full error body.
- Add frontend schema/component coverage for the extra request-log detail data.

## Impact

- Code: `frontend/src/features/dashboard/components/recent-requests-table.tsx`,
  `frontend/src/features/dashboard/schemas.ts`
- Tests: dashboard component and schema coverage for request-log detail
  visibility
- Specs: `openspec/specs/frontend-architecture/spec.md`
