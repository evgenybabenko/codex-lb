## Why

`codex-lb` already retries several transient upstream failures internally, but HTTP `previous_response_id` still fails closed once the local bridge session has gone stale, even when the proxy still holds enough reconnect state to revive that bridge safely. In practice that pushes recovery work to the client even though the proxy is the layer that owns session bridging.

Separately, the local main/sandbox port split is easy to misread because the stable mapping exists in context docs but is not called out plainly in the primary developer README.

## What Changes

- allow HTTP bridge continuity recovery for `previous_response_id` when the proxy still has a stale local bridge session with resumable turn-state metadata
- keep fail-closed behavior when no resumable local continuity state exists
- document the stable local port map for `main` and `develop` sandbox stacks in the main README and frontend architecture context

## Impact

- `responses-api-compat`: HTTP bridge continuation can revive a stale local bridge when codex-lb still owns safe reconnect metadata
- `frontend-architecture`: the main vs sandbox port split is explicitly documented for daily development
