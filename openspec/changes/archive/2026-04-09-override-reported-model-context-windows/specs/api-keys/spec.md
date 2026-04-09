### Requirement: Reported model context window overrides

The system SHALL support an optional server-side override map for client-facing model metadata `context_window` values.

The override source SHALL be configuration key `CODEX_LB_MODEL_CONTEXT_WINDOW_OVERRIDES`, parsed as a JSON object mapping model slug to positive integer context window.

When an override exists for a model slug, the system SHALL expose the overridden `context_window` value consistently across `/api/models`, `/v1/models`, and `/backend-api/codex/models`. When no override exists, the system SHALL expose the upstream registry value unchanged.

#### Scenario: Override applied to /v1/models

- **GIVEN** `CODEX_LB_MODEL_CONTEXT_WINDOW_OVERRIDES='{"gpt-5.4": 515000}'`
- **AND** the model registry contains `gpt-5.4` with upstream `context_window=272000`
- **WHEN** client calls `GET /v1/models`
- **THEN** the `gpt-5.4` entry exposes `metadata.context_window=515000`

#### Scenario: Override applied consistently across model endpoints

- **GIVEN** `CODEX_LB_MODEL_CONTEXT_WINDOW_OVERRIDES='{"gpt-5.4": 515000}'`
- **AND** the model registry contains `gpt-5.4` with upstream `context_window=272000`
- **WHEN** clients call `/api/models`, `/v1/models`, and `/backend-api/codex/models`
- **THEN** all three endpoints expose the same overridden `context_window` for `gpt-5.4`

#### Scenario: Non-overridden model keeps upstream value

- **GIVEN** `CODEX_LB_MODEL_CONTEXT_WINDOW_OVERRIDES='{"gpt-5.4": 515000}'`
- **AND** the model registry contains `gpt-5.3-codex` with upstream `context_window=272000`
- **WHEN** client calls any model list endpoint
- **THEN** the `gpt-5.3-codex` entry still exposes `metadata.context_window=272000`
