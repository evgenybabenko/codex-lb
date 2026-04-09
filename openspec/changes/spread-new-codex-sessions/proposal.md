## Why

Backend Codex requests already treat `x-codex-turn-state` and `session_id`
as durable affinity keys, but that only keeps one session on one account after
the initial placement. It does not prevent several newly created subagent
sessions from all landing on the same highest-priority account in a short burst.

Operators need a bounded way to spread only new Codex sessions across the
current top-ranked accounts without weakening the existing affinity guarantees
for sessions that have already been pinned.

## What Changes

- Add dashboard-managed settings for spreading new Codex sessions:
  - enable/disable switch
  - short time window in seconds
  - top-ranked account pool size
- Persist a shared DB history of recent new-session assignments so the rule
  works across replicas.
- Apply the spread rule only when a durable `codex_session` sticky mapping does
  not yet exist.
- Keep existing sticky mappings, prompt-cache affinity, and sticky-thread
  behavior unchanged.

## Impact

- New subagent sessions created in the same short interval are less likely to
  pile onto the same highest-priority account.
- Existing Codex session affinity remains durable once a session has been
  assigned.
- Operators can tune or disable the behavior from the dashboard without restart.
