## Why

The current client and server each centralize unrelated concerns in a single file. Domain types, validation, persistence, HTTP wiring, view helpers, state orchestration, and large UI sections are mixed together, which makes the code harder to navigate, test, and extend safely.

This refactor should establish explicit organization rules before the codebase grows further.

## What Changes

- Define file-organization rules for the server and client codebases.
- Split mixed-responsibility files into modules grouped by domain responsibility.
- Preserve current product behavior while improving navigability and testability.
- Document the organization style in repository guidance files.

## Capabilities

### New Capabilities
- `code-organization`: Enforce modular boundaries for domain models, infrastructure, application logic, and UI composition.

### Modified Capabilities
- `preschool-participation`: Internal implementation is reorganized without changing user-facing behavior.

## Impact

- Affected code: `server/src/**`, `client/src/**`, repository guidance docs.
- Affected systems: application structure, testability, onboarding, and maintenance ergonomics.
- Dependencies: existing test suites must remain green to confirm behavior preservation.
