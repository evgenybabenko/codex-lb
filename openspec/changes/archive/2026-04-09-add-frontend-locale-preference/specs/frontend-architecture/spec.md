## ADDED Requirements

### Requirement: Frontend locale preference is user-selectable

The React frontend SHALL let the user choose the interface language from
Appearance settings. The selected language MUST persist locally and MUST be
restored on later visits before the main application shell renders.

#### Scenario: Operator switches interface language

- **WHEN** the operator selects a supported language from Appearance settings
- **THEN** the app shell updates its shared labels to the selected language
- **AND** the chosen language persists for the next visit

### Requirement: Dashboard request-log shell honors locale preference

The dashboard shell and recent request-log section SHALL render their shared UI
labels from the active frontend locale so operators can read the main
navigation, dashboard headings, and request-log detail controls in the selected
language.

#### Scenario: Request-log controls use the active locale

- **WHEN** the frontend locale preference is set to a supported non-default
  language
- **THEN** the dashboard request-log section headings, visibility controls, and
  request detail dialog labels render in that language
