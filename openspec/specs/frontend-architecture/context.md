# Overview

This capability uses a two-stack local workflow so Codex App can keep using a
stable `main` deployment while UI and frontend work continue against a separate
`develop` sandbox.

The normative requirements for the frontend still live in
[`spec.md`](./spec.md). This context doc records the local operating model,
port layout, and failure modes that matter when working on the dashboard UI.

# Local Topology

The local setup uses two Git worktrees from the same repository:

- primary development worktree: `codex-lb/` on branch `develop`
- stable worktree: `codex-lb-main/` on branch `main`

Each worktree runs its own Docker Compose project:

- `codex-lb-main` from `codex-lb-main/docker-compose.yml`
- `codex-lb-sandbox` from `codex-lb/docker-compose.sandbox.yml`

The intended port split is:

- `2455` backend + `5173` frontend = stable `main`
- `2456` backend + `5174` frontend = `develop` sandbox

The stable stack also publishes OAuth callback port `1455`, while the sandbox
does not.

# Decisions

- Keep Codex App pointed at the stable stack on `http://127.0.0.1:2455`.
- Keep UI iteration and risky restarts isolated to the sandbox on
  `2456/5174`.
- Use separate host data directories from `.env.local` so the main and sandbox
  stacks do not share SQLite files or encryption keys.
- Prefer switching between worktrees by opening the corresponding directory,
  not by repeatedly changing branches inside one checkout.

# Operational Notes

Codex App currently uses the provider configuration in `~/.codex/config.toml`
with:

```toml
[model_providers.codex-lb]
base_url = "http://127.0.0.1:2455/backend-api/codex"
```

That means active Codex App chats depend on the `main` stack on port `2455`,
not the sandbox on `2456`.

The compose files are expected to read these `.env.local` variables:

- `CODEX_LB_HOST_DATA_DIR` for the main/runtime stack
- `CODEX_LB_SANDBOX_HOST_DATA_DIR` for the sandbox stack

Each variable should point at a developer-local directory. The path values are
machine-specific, but the Compose files stay shared and portable because the
actual paths live only in untracked environment config.

When the topology is healthy:

- `codex-lb-main-*` containers come from the `codex-lb-main/` worktree
- `codex-lb-sandbox-*` containers come from the `codex-lb/` worktree

# Failure Modes

- Restarting or stopping the sandbox should affect only UI testing on
  `2456/5174`.
- Restarting or stopping the main stack interrupts Codex App because the app
  provider is pinned to `2455`.
- Browser OAuth flows on the main stack can conflict with native Codex CLI
  login because both want `localhost:1455`.
- If both stacks are started from the same worktree, `--reload` will pick up
  the same source edits and the stable/develop split stops being meaningful.

# Example Workflow

Use this split for routine frontend work:

1. Keep `codex-lb-main/` running as the stable stack on `2455/5173`.
2. Make UI changes in `codex-lb/` on branch `develop`.
3. Rebuild or restart only the sandbox stack on `2456/5174`.
4. Verify the Codex App chat still works against `2455`.
5. Merge validated `develop` changes back into `main` when ready.

This model lets the dashboard UI evolve without interrupting the active Codex
App provider path unless the main stack itself is intentionally restarted.
