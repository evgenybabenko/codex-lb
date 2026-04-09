# Protect Remote Dashboard Bootstrap Setup

## Problem

When no dashboard password is configured, the UI is intentionally open so the operator can perform first-time setup from the settings page.

That convenience becomes risky when the service is reachable from outside the host: a remote visitor can race the operator and set the first dashboard password before the owner does.

## Solution

Require an explicit bootstrap token only for remote first-time password setup.

- add `CODEX_LB_DASHBOARD_BOOTSTRAP_TOKEN` as an optional environment variable
- detect whether the setup request is local or remote using the effective client IP
- when no password is configured, the bootstrap token is configured, and the request is remote:
  - `GET /api/dashboard-auth/session` reports that bootstrap token input is required
  - `POST /api/dashboard-auth/password/setup` rejects missing or invalid bootstrap tokens
- keep localhost / loopback first-time setup unchanged so local development stays simple

## Changes

- add validated config for the optional bootstrap token
- add request locality detection for dashboard setup requests
- extend the dashboard auth session and password setup payloads with bootstrap-token signaling
- show a bootstrap-token field in the password setup dialog only when the server says it is required
- add backend and frontend regression coverage for local and remote flows

## Impact

- local first-time setup remains one click on localhost
- remote first-time setup becomes protected by an operator-provided secret
- existing installs with an already configured password are unaffected
