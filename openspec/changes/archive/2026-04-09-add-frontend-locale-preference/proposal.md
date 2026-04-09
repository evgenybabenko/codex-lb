## Why

The frontend currently hardcodes interface text in English. That makes forked
localization work hard to compare and impossible to adopt incrementally because
there is no shared locale preference, persistence, or translation lookup layer.

We do not need full-application translation in one step, but we do need a
small foundation that lets operators choose a UI language and see that
preference applied consistently on the most visible dashboard and settings
surfaces.

## What Changes

- Add a persisted frontend locale preference with English and Russian options.
- Add a lightweight translation catalog/helper for shared UI text.
- Expose the language switcher from Appearance settings.
- Localize the app shell plus the dashboard/settings request-log surfaces that
  operators see first.

## Impact

- Code: `frontend/src/hooks/*`, `frontend/src/lib/*`,
  `frontend/src/components/layout/*`, `frontend/src/features/dashboard/*`,
  `frontend/src/features/settings/*`
- Tests: locale store or appearance settings coverage plus targeted dashboard
  component coverage
- Specs: `openspec/specs/frontend-architecture/spec.md`
