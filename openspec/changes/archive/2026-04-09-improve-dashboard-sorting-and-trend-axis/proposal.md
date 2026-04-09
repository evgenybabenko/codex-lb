## Why

The dashboard account cards currently render in backend order, which makes quick operational scanning harder once the pool grows. The top KPI sparklines also show only abstract lines without visible time anchors on the X axis.

## What Changes

- Add compact icon-based sorting controls above the dashboard account cards.
- Support dashboard sorting by email, workspace, remaining 5h, remaining 7d, reset time 5h, and reset time 7d.
- Render date ticks directly on KPI sparkline X axes so spikes can be interpreted in time without a separate period caption.

## Capabilities

### Modified Capabilities

- `frontend-architecture`: The dashboard must expose compact account-card sorting controls and KPI sparklines with readable X-axis time anchors.

## Impact

- Frontend dashboard account-card ordering and KPI sparkline rendering.
- No API contract change.
