## Why
Account import and OAuth login currently distinguish duplicate accounts only by generated account ID and optional `__copyN` suffixes. That makes same-login accounts from different OpenAI workspaces hard to keep separate and hard to recognize in the dashboard.

## What Changes
- extract workspace/organization metadata from auth tokens during import, OAuth login, and token refresh
- treat workspace-aware duplicates as mergeable only while the upstream ChatGPT account identity remains the same
- backfill legacy accounts from stored id tokens before overwrite-mode merges so re-adding the same email in another workspace does not overwrite the older row
- expose workspace metadata in account APIs and dashboard UI so duplicate logins remain distinguishable without manual labels

## Impact
- Code: `app/core/auth/__init__.py`, `app/core/auth/refresh.py`, `app/modules/accounts/*`, `app/modules/oauth/service.py`, `frontend/src/features/accounts/*`, `frontend/src/utils/account-identifiers.ts`
- DB: add nullable `accounts.workspace_id` and `accounts.workspace_name`
- Tests: auth parsing, accounts import, OAuth duplicate handling
