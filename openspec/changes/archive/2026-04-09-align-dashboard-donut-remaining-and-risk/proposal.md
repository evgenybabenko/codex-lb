## Why

The Dashboard usage donuts currently mix two different semantics: the center label says `Remaining` while the value shown is total capacity, and the safe-line marker is derived from the single riskiest account while the donut itself visualizes the aggregate pool. That makes the charts easy to misread during operations and undermines trust in the dashboard.

## What Changes

- Change the Dashboard usage donuts so the center value reflects the aggregate remaining quota shown by the colored segments, not total capacity.
- Change the Dashboard safe-line marker so it is computed from aggregate pool depletion rather than the worst individual account.
- Always render the Dashboard safe-line marker when aggregate depletion data exists, including `safe` states, so it can be read as a pool-level time marker.
- Clarify the Dashboard donut semantics so operators can read the marker as a pool-level safe pace threshold and elapsed-window marker.

## Capabilities

### New Capabilities

### Modified Capabilities

- `frontend-architecture`: Dashboard usage donuts must display aggregate remaining quota and a pool-level safe-line marker that matches the aggregate visualization.

## Impact

- Frontend Dashboard view model, donut chart props, and dashboard copy.
- Backend dashboard depletion aggregation logic used by the Dashboard overview API.
- Dashboard component and utility tests covering remaining totals and safe-line behavior.
