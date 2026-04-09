# Override Reported Model Context Windows

## Problem

`codex-lb` currently passes `context_window` from the upstream model registry directly to clients on `/api/models`, `/v1/models`, and `/backend-api/codex/models`.

That is usually fine, but some clients use the server-reported value as the source of truth for when to compact or warn about context size. When the upstream value is conservative or temporarily wrong, operators have no way to correct what the client sees without patching code.

## Solution

Add an optional server-side configuration map that overrides reported `context_window` values per model slug.

- configuration key: `CODEX_LB_MODEL_CONTEXT_WINDOW_OVERRIDES`
- format: JSON object of `{ "<model-slug>": <positive-int> }`
- apply the override consistently across `/api/models`, `/v1/models`, and `/backend-api/codex/models`
- leave upstream values unchanged for models that are not explicitly overridden

## Changes

- add a validated settings field for per-model context-window overrides
- apply overrides when serializing model metadata for client-facing model list endpoints
- add integration coverage for overridden and default cases

## Impact

- operators can correct reported context windows without changing the upstream registry
- Codex clients can compact later when the local deployment knows a safer, larger usable window
- default behavior stays unchanged unless the override map is configured
