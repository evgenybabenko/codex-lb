## Why

Upstream Responses requests can fail with temporary model-capacity signals such as `server_is_overloaded` or text like `Selected model is at capacity. Please try a different model.` Today the proxy does not consistently classify those failures as recoverable capacity events, so the request can surface a raw notification to the client instead of failing over to another available account.

## What Changes

- classify upstream overload/capacity errors as recoverable stream failures
- infer the overload classification from generic upstream error messages when the upstream code is too generic
- treat overload failures like rate-limit class events for account health and request-log status filters
- add regression coverage for stream failover and message-based overload normalization

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `responses-api-compat`: streaming Responses requests recover from upstream model-capacity failures via normal failover rules

## Impact

- Code: `app/modules/proxy/helpers.py`, `app/modules/proxy/service.py`, `app/core/clients/proxy.py`, `app/modules/request_logs/mappers.py`
- Tests: `tests/integration/test_proxy_transient_retry.py`, `tests/integration/test_request_logs_filters.py`, `tests/unit/test_proxy_errors.py`
- Specs: `openspec/specs/responses-api-compat/spec.md`
