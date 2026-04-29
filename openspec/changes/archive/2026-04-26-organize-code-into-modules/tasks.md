## 1. Specify the organization rules

- [x] 1.1 Add an OpenSpec proposal, design, and spec for modular file organization
- [x] 1.2 Define repository guidance updates for AGENTS.md and codex.md

## 2. Lock current behavior with tests

- [x] 2.1 Add tests for extracted server-side pure logic seams
- [x] 2.2 Add tests for extracted client-side pure logic seams

## 3. Refactor the server into modules

- [x] 3.1 Extract server domain types, constants, and state defaults
- [x] 3.2 Extract server migration, persistence, auth, validation, and reward helpers
- [x] 3.3 Extract server route registration by feature while preserving current API behavior

## 4. Refactor the client into modules

- [x] 4.1 Extract client app/domain types, constants, and API helpers
- [x] 4.2 Extract client pure view-state helpers
- [x] 4.3 Extract major UI sections/components while preserving behavior

## 5. Verify and document

- [x] 5.1 Run relevant tests and builds to confirm behavior preservation
- [x] 5.2 Update AGENTS.md and codex.md with design style guidelines for code organization

## 6. Share cross-layer contracts

- [x] 6.1 Move duplicated client/server domain contracts into a shared workspace package
- [x] 6.2 Keep client-only and server-only types local to their layers
- [x] 6.3 Re-run tests and builds after the shared-contract refactor
