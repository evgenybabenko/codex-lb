# api-keys Specification

## Purpose
Define the dashboard API-key management and enforcement contract, including key
creation, regeneration, model restrictions, usage accounting, and settings
integration.
## Requirements
### Requirement: API Key creation

The system SHALL allow the admin to create API keys via `POST /api/api-keys`
with a required `name`, optional model restrictions, optional enforced routing
fields, optional expiration, and optional usage limits.

The public key value MUST use the `sk-clb-` prefix, MUST be stored only as a
`sha256` hash in the database, and MUST be returned in plain form exactly once
in the creation response.

The request MAY use legacy `weeklyTokenLimit` or modern `limits` payloads. The
system MUST accept timezone-aware ISO 8601 datetimes for `expiresAt`,
normalize them to UTC naive for persistence, and return the expiration as UTC
in API responses.

#### Scenario: Create key with all options

- **WHEN** admin submits `POST /api/api-keys` with `{ "name": "dev-key", "allowedModels": ["o3-pro"], "limits": [{ "limitType": "total_tokens", "limitWindow": "weekly", "maxValue": 1000000 }], "expiresAt": "2025-12-31T00:00:00Z" }`
- **THEN** the system returns a key object containing `key`, `keyPrefix`, metadata, and normalized limit rules
- **AND** the plain key is visible only in this response

#### Scenario: Create key with timezone-aware expiration

- **WHEN** admin submits `POST /api/api-keys` with `{ "name": "dev-key", "expiresAt": "2025-12-31T00:00:00Z" }`
- **THEN** the system persists the expiration successfully without PostgreSQL datetime binding errors
- **AND** the response returns `expiresAt` representing the same UTC instant

#### Scenario: Create key with defaults

- **WHEN** admin submits `POST /api/api-keys` with `{ "name": "open-key" }` and no optional fields
- **THEN** the system creates a key with `allowedModels: null`, no enforced model overrides, no limit rules, and `expiresAt: null`

#### Scenario: Create key with duplicate name

- **WHEN** admin submits a key with a `name` that already exists
- **THEN** the system creates the key (names are labels, not unique constraints)

### Requirement: API Key listing

The system SHALL expose `GET /api/api-keys` returning all API keys with their
metadata. The response MUST NOT include the key hash or plain key.

Each key MUST include `id`, `name`, `keyPrefix`, `allowedModels`,
`enforcedModel`, `enforcedReasoningEffort`, `enforcedServiceTier`,
`expiresAt`, `isActive`, `createdAt`, `lastUsedAt`, `limits`, and optional
`usageSummary`.

#### Scenario: List keys

- **WHEN** admin calls `GET /api/api-keys`
- **THEN** the system returns an array of key objects ordered by `createdAt` descending, without `key` or `keyHash` fields

#### Scenario: No keys exist

- **WHEN** no API keys have been created
- **THEN** the system returns an empty array `[]`

### Requirement: API Key update

The system SHALL allow updating key properties via `PATCH /api/api-keys/{id}`.
Updatable fields include `name`, `allowedModels`, `enforcedModel`,
`enforcedReasoningEffort`, `enforcedServiceTier`, `limits`, legacy
`weeklyTokenLimit`, `expiresAt`, `isActive`, and `resetUsage`. The key hash and
prefix MUST NOT be modifiable. The system MUST accept timezone-aware ISO 8601
datetimes for `expiresAt` and normalize them to UTC naive before persistence.

#### Scenario: Update allowed models

- **WHEN** admin submits `PATCH /api/api-keys/{id}` with `{ "allowedModels": ["o3-pro", "gpt-4.1"] }`
- **THEN** the system updates the allowed models list and returns the updated key

#### Scenario: Deactivate key

- **WHEN** admin submits `PATCH /api/api-keys/{id}` with `{ "isActive": false }`
- **THEN** the key is deactivated; subsequent Bearer requests using this key SHALL be rejected with 401

#### Scenario: Update key with timezone-aware expiration

- **WHEN** admin submits `PATCH /api/api-keys/{id}` with `{ "expiresAt": "2025-12-31T00:00:00Z" }`
- **THEN** the system persists the expiration successfully without PostgreSQL datetime binding errors
- **AND** the response returns `expiresAt` representing the same UTC instant

#### Scenario: Update non-existent key

- **WHEN** admin submits `PATCH /api/api-keys/{id}` with an unknown ID
- **THEN** the system returns 404

### Requirement: API Key deletion

The system SHALL allow deleting an API key via `DELETE /api/api-keys/{id}`. Deletion MUST be permanent and the key MUST immediately stop authenticating.

#### Scenario: Delete existing key

- **WHEN** admin calls `DELETE /api/api-keys/{id}` for an existing key
- **THEN** the key is permanently removed from the database and returns 204

#### Scenario: Delete non-existent key

- **WHEN** admin calls `DELETE /api/api-keys/{id}` with an unknown ID
- **THEN** the system returns 404

### Requirement: API Key regeneration

The system SHALL allow regenerating an API key via
`POST /api/api-keys/{id}/regenerate`. This MUST generate a new key value (new
hash, new prefix) while preserving all other properties (name, restrictions,
limits, and expiration). The new plain key MUST be returned exactly once.

#### Scenario: Regenerate key

- **WHEN** admin calls `POST /api/api-keys/{id}/regenerate`
- **THEN** the system returns the updated key object with a new `key` and `keyPrefix`; the old key immediately stops authenticating

### Requirement: API Key authentication global switch

The system SHALL provide an `api_key_auth_enabled` boolean in `DashboardSettings`. When false (default), all proxy endpoints allow unauthenticated access. When true, all proxy endpoints require a valid API key via `Authorization: Bearer <key>`.

#### Scenario: Enable API key auth

- **WHEN** admin submits `PUT /api/settings` with `{ "apiKeyAuthEnabled": true }`
- **THEN** subsequent proxy requests without a valid Bearer token are rejected with 401

#### Scenario: Disable API key auth

- **WHEN** admin submits `PUT /api/settings` with `{ "apiKeyAuthEnabled": false }`
- **THEN** proxy requests are allowed without authentication

#### Scenario: Enable without any keys created

- **WHEN** admin enables API key auth but no keys exist
- **THEN** all proxy requests are rejected with 401 (the system SHALL NOT prevent enabling even if no keys exist)

### Requirement: API Key Bearer authentication guard

The system SHALL validate API keys on proxy routes (`/v1/*`, `/backend-api/codex/*`, `/backend-api/transcribe`) when `api_key_auth_enabled` is true. Validation MUST be implemented as a router-level `Security` dependency, not ASGI middleware. The dependency MUST compute `sha256` of the Bearer token and look up the hash in the `api_keys` table.

The dependency SHALL return a typed `ApiKeyData` value directly to the route handler. Route handlers MUST NOT access API key data via `request.state`.

`/api/codex/usage` SHALL NOT be covered by the API key auth guard scope.

The dependency SHALL raise a domain exception on validation failure. The exception handler SHALL format the response using the OpenAI error envelope.

#### Scenario: API key guard route scope

- **WHEN** `api_key_auth_enabled` is true and a request is made to `/v1/responses`, `/backend-api/codex/responses`, `/v1/audio/transcriptions`, or `/backend-api/transcribe`
- **THEN** the API key guard validation is applied

#### Scenario: Codex usage excluded from API key guard scope

- **WHEN** `api_key_auth_enabled` is true and a request is made to `/api/codex/usage`
- **THEN** API key guard validation is not applied

#### Scenario: Valid API key injected into handler

- **WHEN** `api_key_auth_enabled` is true and a valid Bearer token is provided
- **THEN** the route handler receives a typed `ApiKeyData` parameter (not `request.state`)

#### Scenario: API key auth disabled returns None

- **WHEN** `api_key_auth_enabled` is false
- **THEN** the dependency returns `None` and the request proceeds without authentication

### Requirement: API keys can read their own `/v1/usage`

The system SHALL expose `GET /v1/usage` for self-service usage lookup by API-key
clients. The route MUST require a valid `Authorization: Bearer sk-clb-...`
header even when `api_key_auth_enabled` is false globally. The response MUST
include only data for the authenticated key and MUST return `request_count`,
`total_tokens`, `cached_input_tokens`, `total_cost_usd`, and `limits[]`
containing `limit_type`, `limit_window`, `max_value`, `current_value`,
`remaining_value`, `model_filter`, and `reset_at`.

Validation failures MUST use the existing OpenAI error envelope used by
`/v1/*` routes.

#### Scenario: Missing API key is rejected

- **WHEN** a client calls `GET /v1/usage` without a Bearer token
- **THEN** the system returns 401 in the OpenAI error format

#### Scenario: Invalid API key is rejected

- **WHEN** a client calls `GET /v1/usage` with an unknown, expired, or inactive Bearer key
- **THEN** the system returns 401 in the OpenAI error format

#### Scenario: Key with no usage returns zero totals

- **WHEN** a valid API key with no request-log usage calls `GET /v1/usage`
- **THEN** the system returns `request_count: 0`, `total_tokens: 0`, `cached_input_tokens: 0`, `total_cost_usd: 0.0`

#### Scenario: Usage is scoped to the authenticated key

- **WHEN** multiple API keys have request-log history and one of them calls `GET /v1/usage`
- **THEN** the response includes only the usage totals and limits for that authenticated key

#### Scenario: Self-usage works while global proxy auth is disabled

- **WHEN** `api_key_auth_enabled` is false and a client calls `GET /v1/usage` with a valid Bearer key
- **THEN** the system still authenticates that key and returns the self-usage payload

### Requirement: Model restriction enforcement

The system SHALL enforce per-key model restrictions in the proxy service layer (not middleware). When `allowed_models` is set (non-null, non-empty) and the requested model is not in the list, the system MUST reject the request. The `/v1/models` endpoint MUST filter the model list based on the authenticated key's `allowed_models`.

For fixed-model endpoints such as `/v1/audio/transcriptions` and `/backend-api/transcribe`, the service MUST evaluate restrictions against fixed effective model `gpt-4o-transcribe`.

#### Scenario: Requested model not allowed

- **WHEN** a key has `allowed_models: ["o3-pro"]` and a request is made for model `gpt-4.1`
- **THEN** the proxy returns 403 with OpenAI-format error `{ "error": { "code": "model_not_allowed", "message": "This API key does not have access to model 'gpt-4.1'" } }`

#### Scenario: All models allowed

- **WHEN** a key has `allowed_models: null`
- **THEN** any model is permitted

#### Scenario: Model list filtered

- **WHEN** a key with `allowed_models: ["o3-pro"]` calls `GET /v1/models`
- **THEN** the response contains only models matching the allowed list

#### Scenario: No API key auth (disabled)

- **WHEN** `api_key_auth_enabled` is false and a request is made to `/v1/models`
- **THEN** the full model catalog is returned

#### Scenario: Fixed transcription model not allowed

- **WHEN** a key has `allowed_models: ["gpt-5.1"]` and a request is made to `/v1/audio/transcriptions` or `/backend-api/transcribe`
- **THEN** the proxy returns 403 with OpenAI-format error code `model_not_allowed` for model `gpt-4o-transcribe`

### Requirement: API keys can enforce a service tier

The dashboard API key CRUD surface MUST allow callers to persist an optional
enforced service tier. The service MUST normalize `fast` to the canonical
upstream value `priority` before persistence and before returning the API key
payload.

#### Scenario: Create API key with fast service tier alias

- **WHEN** a dashboard client creates an API key with `enforcedServiceTier: "fast"`
- **THEN** the request is accepted
- **AND** the persisted API key stores the canonical value `priority`
- **AND** the response returns `enforcedServiceTier: "priority"`

#### Scenario: Update API key with canonical service tier

- **WHEN** a dashboard client updates an API key with `enforcedServiceTier: "flex"`
- **THEN** the persisted API key stores `flex`
- **AND** subsequent reads return `flex`

### Requirement: Weekly token usage tracking

The system SHALL atomically increment `weekly_tokens_used` on the API key record when a proxy request completes with token usage data. The token count MUST be `input_tokens + output_tokens`. If token usage is unavailable (error response), the counter MUST NOT be incremented.

#### Scenario: Successful request with usage

- **WHEN** a proxy request completes with `input_tokens: 100, output_tokens: 50` for an authenticated key
- **THEN** `weekly_tokens_used` is atomically incremented by 150

#### Scenario: Request with no usage data

- **WHEN** a proxy request fails with an error and no usage data is returned
- **THEN** `weekly_tokens_used` is not incremented

#### Scenario: Request without API key auth

- **WHEN** `api_key_auth_enabled` is false and a proxy request completes
- **THEN** no API key usage tracking occurs

### Requirement: Weekly token usage reset

The system SHALL reset `weekly_tokens_used` to 0 using a lazy on-read strategy. When validating an API key, if `weekly_reset_at < now()`, the system MUST reset the counter and advance `weekly_reset_at` by 7-day intervals until it is in the future.

#### Scenario: Weekly reset triggered on validation

- **WHEN** an API key is validated and `weekly_reset_at` is 2 weeks in the past
- **THEN** `weekly_tokens_used` is set to 0 and `weekly_reset_at` is advanced by 14 days (2 × 7 days) to a future date

#### Scenario: No reset needed

- **WHEN** an API key is validated and `weekly_reset_at` is in the future
- **THEN** no reset occurs; `weekly_tokens_used` retains its current value

### Requirement: RequestLog API key reference

The system SHALL record the `api_key_id` in the `request_logs` table for proxy requests authenticated with an API key. The field MUST be NULL when API key auth is disabled or the request is unauthenticated.

#### Scenario: Authenticated request logged

- **WHEN** a proxy request is authenticated with API key `key-123` and completes
- **THEN** the `request_logs` entry has `api_key_id = "key-123"`

#### Scenario: Unauthenticated request logged

- **WHEN** API key auth is disabled and a proxy request completes
- **THEN** the `request_logs` entry has `api_key_id = NULL`

### Requirement: Frontend API Key management

The SPA settings page SHALL include an API Key management section with: a toggle for `apiKeyAuthEnabled`, a key list table showing prefix/name/models/limit/usage/expiry/status, a create dialog (name, model selection, weekly limit, expiry date), and key actions (edit, delete, regenerate). On key creation, the SPA MUST display the plain key in a copy-able dialog with a warning that it will not be shown again.

#### Scenario: Create key and show plain key

- **WHEN** admin creates a key via the UI
- **THEN** a dialog shows the full plain key with a copy button and a warning message

#### Scenario: Toggle API key auth

- **WHEN** admin toggles `apiKeyAuthEnabled` in settings
- **THEN** the system calls `PUT /api/settings` and reflects the new state

### Requirement: Cost accounting uses model and service-tier pricing
When computing API key `cost_usd` usage, the system MUST price requests using the resolved model pricing and the authoritative `service_tier` reported by the upstream response when available, falling back to the forwarded request `service_tier` only when the response omits it. Requests sent with non-standard service tiers MUST use the published pricing for the tier actually used instead of falling back to standard-tier pricing.

#### Scenario: Priority-tier request increments cost limit
- **WHEN** an authenticated request for a priced model is finalized with `service_tier: "priority"`
- **THEN** the system computes `cost_usd` using the priority-tier rate for that model

#### Scenario: Flex-tier request increments cost limit
- **WHEN** an authenticated request for a priced model is finalized with `service_tier: "flex"`
- **THEN** the system computes `cost_usd` using the flex-tier rate for that model

#### Scenario: Standard-tier request keeps standard pricing
- **WHEN** an authenticated request for the same model is finalized without `service_tier`
- **THEN** the system computes `cost_usd` using the standard-tier rate

#### Scenario: Requested and actual tiers differ
- **WHEN** a priced request is sent with `requested_service_tier: "priority"`
- **AND** the upstream reports `actual_service_tier: "default"`
- **THEN** the persisted billable `service_tier` is `default`
- **AND** API key cost accounting uses the `default` tier rate for that request

### Requirement: gpt-5.4 pricing is recognized
The system MUST recognize `gpt-5.4` pricing when computing request costs. For standard-tier requests with more than 272K input tokens, the system MUST apply the published higher long-context rates.

#### Scenario: gpt-5.4 request priced at standard tier
- **WHEN** a request for `gpt-5.4` completes with standard service tier
- **THEN** the system computes non-zero cost using the configured `gpt-5.4` standard rates

#### Scenario: gpt-5.4 long-context request priced at long-context rates
- **WHEN** a standard-tier `gpt-5.4` request completes with more than 272K input tokens
- **THEN** the system computes cost using the configured long-context `gpt-5.4` rates

### Requirement: Model-scoped limit enforcement

The system SHALL separate authentication validation from quota enforcement. `validate_key()` in the auth guard SHALL only verify key validity (existence, active status, expiry, basic reset). Quota enforcement SHALL occur at a point where the request model is known.

Limit applicability rules:
- `limit.model_filter is None` → always applies (global limit)
- `limit.model_filter == request_model` → applies (model-scoped limit)
- otherwise → does not apply for this request

For model-less requests (e.g., `/v1/models`), only global limits SHALL be evaluated.

The service contract SHALL be typed explicitly: `enforce_limits_for_request(key_id: str, *, request_model: str | None, request_service_tier: str | None = None) -> None`.

#### Scenario: Model-scoped limit does not block other models

- **WHEN** `model_filter="gpt-5.1"` limit is exhausted
- **AND** request model is `gpt-4o-mini`
- **THEN** the request is allowed

#### Scenario: Model-scoped limit blocks matching model

- **WHEN** `model_filter="gpt-5.1"` limit is exhausted
- **AND** request model is `gpt-5.1`
- **THEN** the request returns 429

#### Scenario: Model-scoped limit does not block model-less endpoints

- **WHEN** `model_filter="gpt-5.1"` limit is exhausted
- **AND** request is to `/v1/models` (no model context)
- **THEN** the request is allowed

#### Scenario: Global limit blocks all proxy requests

- **WHEN** a global limit (no `model_filter`) is exhausted
- **THEN** all proxy requests return 429

### Requirement: Limit update with usage state preservation

When updating API key limits, the system SHALL preserve existing usage state (`current_value`, `reset_at`) for unchanged limit rules. Limit comparison key is `(limit_type, limit_window, model_filter)`.

- Matching existing rule: `current_value` and `reset_at` SHALL be preserved; only `max_value` is updated
- New rule (no match): `current_value=0` and fresh `reset_at`
- Removed rule (in existing but not in update): row is deleted

Usage reset SHALL only occur via an explicit action (`reset_usage` field or dedicated endpoint), never as a side-effect of metadata or policy edits.

#### Scenario: Metadata-only edit preserves usage state

- **WHEN** an API key PATCH updates only name or is_active
- **AND** `limits` field is not included in the payload
- **THEN** existing `current_value` and `reset_at` are unchanged

#### Scenario: Same policy re-submission preserves usage state

- **WHEN** an API key PATCH includes `limits` with identical rules (same type/window/filter/max_value)
- **THEN** existing `current_value` and `reset_at` are unchanged

#### Scenario: max_value adjustment preserves counters

- **WHEN** an API key PATCH includes `limits` with a changed `max_value` for an existing rule
- **THEN** `current_value` and `reset_at` are preserved; only the threshold changes

#### Scenario: Explicit reset action resets usage

- **WHEN** an explicit usage reset action is invoked
- **THEN** `current_value` is set to 0 and `reset_at` is refreshed

### Requirement: API key edit payload — conditional limits transmission

The frontend API key edit dialog SHALL transmit `limits` in the PATCH payload only when limit values have actually changed. The system SHALL normalize and compare initial and current limit values to detect changes.

- Metadata-only changes (name, is_active): `limits` field MUST be omitted from the payload
- Identical rule sets with different ordering: MUST be treated as unchanged (`limits` omitted)

Backend contract:
- `limits` absent in payload: limit policy unchanged (usage/reset state preserved)
- `limits` present in payload: policy replacement (state-preserving upsert applied)

#### Scenario: Name-only edit omits limits from payload

- **WHEN** only the API key name is modified in the edit dialog
- **THEN** the PATCH payload does not include the `limits` field

#### Scenario: Reordered identical rules treated as unchanged

- **WHEN** the same limit rules are submitted in a different order
- **THEN** the system treats this as unchanged and omits `limits` from the payload

### Requirement: Public model list filtering

All model list endpoints SHALL filter models using a single predicate that requires both conditions:
1. `model.supported_in_api` is true
2. If `allowed_models` is configured, the model is in the allowed set

This predicate SHALL be applied consistently across `/api/models`, `/v1/models`, and `/backend-api/codex/models`.

#### Scenario: Unsupported model excluded from /v1/models

- **WHEN** a model snapshot contains a model with `supported_in_api=false`
- **THEN** that model is not included in the `/v1/models` response

#### Scenario: Unsupported model excluded from /backend-api/codex/models

- **WHEN** a model snapshot contains a model with `supported_in_api=false`
- **THEN** that model is not included in the `/backend-api/codex/models` response

#### Scenario: Allowed but unsupported model excluded

- **WHEN** a model is in the `allowed_models` set but has `supported_in_api=false`
- **THEN** that model is not exposed in any model list endpoint

#### Scenario: Consistent model set across endpoints

- **GIVEN** any model registry state
- **THEN** `/api/models`, `/v1/models`, and `/backend-api/codex/models` expose the same set of models

### Requirement: Reservation settlement is exactly-once

The system MUST settle each usage reservation exactly once per request, whether
through `finalize` or `release`. Retryable intermediate attempts MUST defer
settlement, and one final completion point MUST own the settlement
responsibility for that request.

#### Scenario: Stream 401 then refresh retry succeeds with one finalize

- **WHEN** the first `_stream_once()` attempt receives `401` and a retry after
  account refresh succeeds
- **THEN** the first attempt does not settle the reservation (SHALL)
- **AND** `finalize_usage_reservation()` is called exactly once at final success
  (SHALL)
- **AND** the actual token usage is applied to quota state (SHALL)

#### Scenario: Stream 401 then retries exhaust with one release

- **WHEN** the request ultimately fails after exhausting retries following a
  `401`
- **THEN** `release_usage_reservation()` is called exactly once (SHALL)
- **AND** the reserved quota is restored (SHALL)

#### Scenario: Stream success finalizes once

- **WHEN** `_stream_once()` succeeds on the first attempt without retries
- **THEN** `finalize_usage_reservation()` is called exactly once (SHALL)

### Requirement: Early-exit paths release reservations

The system MUST release a reservation on every path that exits after creating
that reservation but before entering the upstream API call. No reservation may
remain in a `reserved` state after such an early exit.

#### Scenario: Immediate no-accounts exit releases reservation

- **WHEN** `_stream_with_retry()` exits immediately with `no_accounts` after
  creating a reservation
- **THEN** `release_usage_reservation()` is called and the reservation moves to
  `released` (SHALL)
- **AND** the pre-reserved quota is restored (SHALL)

#### Scenario: No-accounts exit after retry exhaustion releases reservation

- **WHEN** the retry loop exhausts every attempt and then exits with
  `no_accounts`
- **THEN** `release_usage_reservation()` is called (SHALL)

#### Scenario: Settlement is skipped when no reservation exists

- **WHEN** a request exits while API-key auth is disabled or no reservation was
  created
- **THEN** the settlement logic safely skips cleanup without raising an error
  (SHALL)

### Requirement: Compact path always cleans up reservations

When a reservation exists in `_compact_responses()`, the reservation MUST be
cleaned up regardless of which exception type is raised. Cleanup MUST NOT rely
on handling only one specific exception class.

#### Scenario: ProxyResponseError releases reservation

- **WHEN** `compact_responses()` raises `ProxyResponseError`
- **THEN** the reservation is released (SHALL)

#### Scenario: Unexpected runtime exception also releases reservation

- **WHEN** `compact_responses()` raises an exception other than
  `ProxyResponseError`
- **THEN** the reservation is released in the same way (SHALL)

#### Scenario: Compact success finalizes reservation

- **WHEN** `compact_responses()` completes successfully
- **THEN** `finalize_usage_reservation()` is called (SHALL)

### Requirement: Finalize and release are idempotent

`finalize_usage_reservation()` and `release_usage_reservation()` MUST behave as
safe no-ops when the reservation was already settled, whether `finalized` or
`released`. Double calls MUST NOT double-apply quota changes or raise errors.

#### Scenario: Release after finalize is a no-op

- **WHEN** `release_usage_reservation()` is called for a reservation already in
  `finalized` state
- **THEN** it returns without additional work (SHALL)
- **AND** quota values remain unchanged (SHALL)

#### Scenario: Finalize after release is a no-op

- **WHEN** `finalize_usage_reservation()` is called for a reservation already in
  `released` state
- **THEN** it returns without additional work (SHALL)
- **AND** quota values remain unchanged (SHALL)

#### Scenario: Duplicate finalize applies usage only once

- **WHEN** `finalize_usage_reservation()` is called twice for the same
  `reservation_id`
- **THEN** usage is applied exactly once (SHALL)

### Requirement: gpt-5.4-mini pricing is recognized

The system MUST recognize `gpt-5.4-mini` pricing when computing request costs. Snapshot aliases for the same model family MUST resolve to the canonical `gpt-5.4-mini` price table entry.

#### Scenario: gpt-5.4-mini request priced at standard tier

- **WHEN** a request for `gpt-5.4-mini` completes with standard service tier
- **THEN** the system computes non-zero cost using the configured `gpt-5.4-mini` standard rates

#### Scenario: gpt-5.4-mini snapshot request priced at canonical rates

- **WHEN** a request for `gpt-5.4-mini-2026-03-17` completes
- **THEN** the system resolves the snapshot alias to `gpt-5.4-mini`
- **AND** the system applies the same standard rates
