## 1. Aggregate Dashboard Semantics

- [x] 1.1 Update Dashboard view-building so donut center totals reflect aggregate remaining quota instead of total capacity.
- [x] 1.2 Update dashboard depletion aggregation so the donut safe-line is computed from aggregate pool depletion for each window.

## 2. Frontend Rendering And Verification

- [x] 2.1 Adjust donut chart rendering and supporting props/tests to match the new aggregate remaining and aggregate safe-line semantics.
- [x] 2.2 Run focused dashboard tests to verify remaining totals and safe-line behavior for the updated donuts.
- [x] 2.3 Update Dashboard safe-line view-model/rendering so the aggregate marker remains visible for `safe` depletion states.
- [x] 2.4 Re-run focused dashboard verification to confirm safe-state markers render in tests and on the live dashboard.
