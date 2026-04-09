## MODIFIED Requirements

### Requirement: Accounts page

The Accounts page SHALL display a two-column layout: left panel with searchable account list, import button, and add account button; right panel with selected account details including usage, token info, and actions (pause/resume/delete/re-authenticate).

#### Scenario: Account import

- **WHEN** a user clicks the import button and uploads an auth.json file
- **THEN** the app calls `POST /api/accounts/import` and refreshes the account list on success

#### Scenario: Duplicate login is separated by workspace identity

- **WHEN** two auth imports or OAuth logins share the same email and ChatGPT account id
- **AND** their token metadata resolves to different workspace or organization ids
- **THEN** the system stores them as separate dashboard accounts even when overwrite mode is enabled
- **AND** the Accounts page shows a workspace or organization label so the user can tell them apart without a manual nickname
