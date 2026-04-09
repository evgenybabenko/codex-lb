## Why

The Dashboard remaining donuts still have three readability problems for operators:

- the titles are partly hardcoded in English and break localized UI,
- the donut center shows only the remaining number instead of a clear `remaining/capacity` pair,
- the time until reset is reduced to text and does not visually communicate how much of the quota window is left.

That makes the quota state harder to read at a glance, especially in Russian UI and during quick operational checks.

## What Changes

- Localize the Dashboard usage donut titles and center copy.
- Show absolute remaining versus total capacity in the donut center using a slash pair.
- Add a compact visual reset indicator that combines a human-readable reset label with a dynamic progress cue for the remaining share of the quota window.

## Capabilities

### Modified Capabilities

- `frontend-architecture`: Dashboard remaining donuts must present localized labels, absolute remaining versus capacity, and a visible time-to-reset cue.

## Impact

- Frontend dashboard donut rendering, copy, and tests.
- No API contract change.
