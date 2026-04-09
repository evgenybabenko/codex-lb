# Tasks

- [x] T1: Add OpenSpec delta requirements for the new weekly reset preference modes and routing settings UI
- [x] T2: Replace the stored boolean weekly-reset toggle with an enum setting and add a forward-only migration that backfills existing values
- [x] T3: Update request-path account selection to support `disabled`, `earlier_reset`, and `expiring_quota_priority`
- [x] T4: Implement the expiring-quota priority formula using remaining weekly capacity with a 12-hour exponential half-life
- [x] T5: Replace the settings toggle with a dropdown and add localized tooltip guidance with examples
- [x] T6: Update related API/frontend schemas, status-bar labels, mocks, and tests
- [x] T7: Run targeted tests and validate OpenSpec specs
- [x] T8: Add a default-on routing toggle that prioritizes accounts with `100%` weekly quota remaining
