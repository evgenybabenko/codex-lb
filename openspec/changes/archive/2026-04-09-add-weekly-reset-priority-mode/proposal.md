# Weekly Reset Priority Mode

## Problem

The routing settings currently expose only a boolean "prefer earlier reset" toggle for weekly quota selection. That toggle can only bias traffic toward accounts whose weekly window resets sooner. It cannot express a stronger "save soon-expiring weekly quota first" policy that also considers how much weekly capacity remains on each account.

This leaves operators with two bad choices:

- disable weekly reset bias and ignore soon-expiring weekly quota entirely
- enable early-reset bias and apply a coarse day-bucket preference that does not distinguish between "almost empty" and "still valuable" weekly windows

## Solution

Replace the boolean weekly-reset toggle with an explicit weekly reset preference mode:

- `disabled`
- `earlier_reset`
- `expiring_quota_priority`

The new `expiring_quota_priority` mode will rank accounts by remaining weekly capacity multiplied by an exponential time-decay factor, so weekly quota that expires sooner becomes more valuable while still reflecting how much weekly budget remains.

Use a half-life of 12 hours by default:

`priority = remaining_weekly_capacity * 0.5 ^ (hours_until_reset / 12)`

This makes the soonest-expiring weekly capacity dominate more aggressively than the existing day-bucket reset preference, while staying smooth and explainable.

Add a separate `prioritize_full_weekly_capacity` setting toggle, enabled by default. When enabled, routing first narrows the pool to accounts whose weekly window is still fully unused (`100%` remaining) before applying the base routing strategy and any weekly reset preference mode within that preferred subset.

## Changes

- add a new settings enum for weekly reset preference and migrate existing saved settings from the old boolean
- update request-path account selection to support the new mode
- add a default-on toggle that prioritizes accounts with `100%` weekly quota remaining
- keep the existing early-reset behavior as a separate selectable mode
- keep the weekly reset mode as a dropdown and add a separate routing toggle for the full-weekly-capacity preference
- add localized explanatory tooltip content with concrete examples for each mode
- update status-bar routing labels to reflect the new weekly reset modes

## Impact

- existing installs preserve their current intent during migration:
  - `false` becomes `disabled`
  - `true` becomes `earlier_reset`
- existing installs default the new full-weekly-capacity preference to enabled
- routing operators gain a third mode that prioritizes saving soon-expiring weekly quota
- the settings UI becomes clearer by separating weekly reset modes from the independent `100% weekly remaining first` toggle
