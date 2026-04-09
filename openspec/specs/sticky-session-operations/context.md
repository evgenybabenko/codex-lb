# Sticky Session Operations Context

## Purpose and Scope

This capability covers operational control of sticky-session mappings after prompt-cache affinity was made bounded. It distinguishes durable backend/session routing from bounded prompt-cache affinity and defines the admin controls around those mappings.

See `openspec/specs/sticky-session-operations/spec.md` for normative requirements.

## Decisions

- Sticky-session rows store an explicit `kind` so prompt-cache cleanup can target only bounded mappings.
- Dashboard prompt-cache TTL is persisted in settings so operators can adjust it without restart.
- Background cleanup removes stale prompt-cache rows proactively, while manual delete and purge endpoints provide operator override.
- Recent first-assignment history for durable `codex_session` routing is stored
  separately from sticky rows. That history exists only to influence initial
  placement of new sessions; it is not the source of truth for later requests.

## Constraints

- Historical sticky-session rows created before the `kind` column are backfilled conservatively to a durable kind to avoid accidental purge.
- Durable `codex_session` and `sticky_thread` mappings are never deleted by automatic cleanup.
- The new-session spread policy must not override an existing durable sticky
  mapping. Once a `codex_session` key is pinned, the sticky row remains the
  routing source of truth.
- Recent assignment history must be shared across replicas, so it cannot live
  only in per-process memory.

## Failure Modes

- Cleanup failures are logged and retried on the next interval; request handling continues.
- Manual purge and delete operations are dashboard-auth protected and return normal dashboard API errors on invalid input or missing keys.
- If recent assignment history is temporarily unavailable, routing falls back to
  the normal priority-based selection path instead of blocking the request.

## Example

- `session_id=subagent-1` gets its first sticky mapping on `account-a`.
- The service also records that first assignment in recent assignment history.
- `session_id=subagent-2` arrives within the spread window and skips
  `account-a` if another top-ranked account is available.
- A follow-up request for `session_id=subagent-1` still goes to `account-a`
  because the sticky row, not the history row, decides established affinity.
