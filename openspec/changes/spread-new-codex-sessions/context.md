# Sandbox Verification Note

This change must be developed and verified only against the sandbox stack.

- Use sandbox backend: `http://127.0.0.1:2456`
- Use sandbox frontend: `http://127.0.0.1:5174`
- Do not rebuild, restart, or verify against the main stack on `2455/5173` unless the user explicitly asks for it in a separate step.

Rationale:

- The user is validating this feature in the sandbox first.
- Main should remain untouched until sandbox behavior is confirmed and accepted.
- Any local UI or API verification for this change should treat `2456/5174` as the source of truth.
