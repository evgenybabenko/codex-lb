## Context

The Dashboard usage donuts currently combine aggregate remaining slices with two mismatched summary signals: the center label renders total capacity and the safe-line marker is sourced from the single worst-account depletion result. Operators read the donut as a pool-level chart, so both summary signals should describe the same aggregate pool state that the slices already represent.

This change touches frontend presentation and backend depletion aggregation, but it does not require an API shape change. The existing overview response already carries enough data to compute aggregate remaining totals and an aggregate depletion marker.

## Goals / Non-Goals

**Goals:**
- Make the donut center value match the aggregate remaining slices rendered in the chart.
- Make the safe-line marker reflect aggregate pool depletion instead of worst-account depletion.
- Keep the safe-line marker visible whenever aggregate depletion exists so operators can read elapsed window progress even in safe states.
- Keep the Dashboard overview response shape stable while improving semantic consistency.

**Non-Goals:**
- Redesign the donut layout or legend structure.
- Add per-account depletion markers to the aggregate donut.
- Change routing behavior or the capacity-credit normalization tables.

## Decisions

- Compute aggregate remaining totals in the frontend from the same per-account remaining items used to render the donut slices.
  Rationale: this guarantees the center number and slices stay in sync without expanding the API contract.

- Compute the safe-line marker from aggregate depletion metrics instead of selecting the worst per-account depletion snapshot.
  Rationale: the donut is a pool visualization, so the marker must express pool-level safe pace. Reusing the worst-account marker overstates risk for the pool and breaks visual semantics.

- Render the aggregate safe-line marker whenever depletion data exists, including `safe` states.
  Rationale: operators read the marker as a temporal guide for where safe spend should be at the current point in the quota window. Hiding it in `safe` states removes that guide exactly when they want to compare current usage against the safe pace.

- Keep depletion API fields stable and reinterpret them as aggregate pool depletion for Dashboard usage donuts.
  Rationale: the consumer already expects a single depletion object per window. Changing semantics without changing the shape keeps the rollout small and avoids frontend schema churn.

- Retain per-account depletion logic as an internal primitive but aggregate burn using total used-percent history per timestamp window.
  Rationale: this preserves the existing EWMA-based depletion model while aligning the resulting marker with pooled usage.

## Risks / Trade-offs

- [Risk] Aggregate depletion can hide a single account that is deteriorating faster than the rest of the pool. → Mitigation: keep account-level detail available in account cards and leave room for a future explicit worst-account alert if needed.
- [Risk] Computing aggregate depletion from uneven account histories may smooth out short-lived spikes. → Mitigation: base the aggregate on the latest in-window snapshots already used by the Dashboard and cover the behavior with focused tests.
- [Risk] Changing the center value from capacity to remaining will visibly change screenshots and operator expectations. → Mitigation: keep the `Remaining` label and align the value with the label so the chart becomes easier, not harder, to read.
- [Risk] A marker that is always visible could be misread as an alert rather than a neutral guide. → Mitigation: keep risk coloring semantics separate from visibility and document the marker as a time/safe-pace reference.
