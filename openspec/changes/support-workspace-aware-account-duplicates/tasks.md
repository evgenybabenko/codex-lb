## 1. Backend identity handling
- [x] 1.1 Parse workspace/organization metadata from imported and OAuth-issued id tokens
- [x] 1.2 Persist workspace metadata on accounts and include it in token refresh updates
- [x] 1.3 Resolve duplicate imports by `(email, workspace)` when workspace metadata is present
- [x] 1.4 Backfill legacy rows from stored id tokens before merge-by-email overwrite paths
- [x] 1.5 Keep same-email rows separate when the upstream ChatGPT account identity changes even inside one workspace

## 2. API and UI visibility
- [x] 2.1 Expose workspace metadata in account API responses
- [x] 2.2 Show workspace labels in account list/detail/dashboard views and use them in duplicate detection/search

## 3. Verification
- [x] 3.1 Add regression tests for workspace-aware import identity
- [x] 3.2 Add regression tests for workspace-aware OAuth identity
