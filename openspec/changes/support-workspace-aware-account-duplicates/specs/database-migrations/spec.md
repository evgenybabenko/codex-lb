## MODIFIED Requirements

### Requirement: Dashboard schema stays aligned with account metadata needs

Dashboard schema migrations SHALL add any new account metadata columns required for routing, identity resolution, or operator-visible account labels.

#### Scenario: Workspace-aware account metadata is available

- **WHEN** the application upgrades to the revision for workspace-aware duplicate accounts
- **THEN** the `accounts` table includes nullable `workspace_id` and `workspace_name` columns
- **AND** existing rows remain valid without backfill
