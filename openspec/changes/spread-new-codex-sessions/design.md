## Overview

The change introduces a "spread on first assignment" policy for durable
`codex_session` routing.

The selection flow becomes:

1. Resolve the highest-priority stable sticky key as before.
2. If a sticky mapping already exists for that key, keep using it.
3. If no mapping exists and the key kind is `codex_session`, optionally apply a
   spread rule before persisting the first mapping.
4. Persist the sticky mapping and record the new-session assignment history.

## Spread Rule

- Input:
  - `enabled`
  - `window_seconds`
  - `top_pool_size`
- Candidate pool:
  - Build the top `N` currently eligible accounts using the existing routing
    strategy and weekly-priority logic.
- Exclusion step:
  - Read recent assignment history inside the configured time window.
  - Exclude accounts already used for other new `codex_session` assignments in
    that window.
- Fallback:
  - If at least one pool candidate remains unused in the window, choose the
    highest-priority unused candidate.
  - If every pool candidate was already used in the window, choose the oldest
    assignment among that same pool.
  - If the pool cannot be formed, fall back to the existing selection logic.

## Affinity Safety

The rule is intentionally limited to the first durable assignment for a session.
It does not run when:

- a sticky mapping already exists for the `codex_session` key
- the routing kind is `prompt_cache`
- the routing kind is `sticky_thread`

This preserves the current meaning of affinity:

- once a session is pinned, later requests for the same session continue using
  the same account unless the normal sticky reallocation rules already allow a
  rebinding

## Shared State

Use a dedicated DB table for recent assignment history rather than process
memory so the rule behaves consistently across replicas. The table stores the
latest assignment timestamp per sticky key and kind and supports:

- upsert on first-session assignment
- querying recent assignments within a time window
- optional background or opportunistic cleanup of stale history rows
