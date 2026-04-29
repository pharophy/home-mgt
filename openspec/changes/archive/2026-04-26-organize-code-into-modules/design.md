## Context

The server currently places domain types, persistence, migration, authorization, validation, reward logic, and all route handlers in `server/src/app.ts`. The client currently places transport types, constants, fetch utilities, derived-state helpers, state orchestration, event handlers, and all rendered sections in `client/src/App.tsx`.

The goal is a structural refactor, not a product redesign. The refactor should preserve behavior while making responsibility boundaries obvious.

## Goals / Non-Goals

**Goals:**
- Separate domain model definitions from infrastructure and UI composition.
- Keep files cohesive around a single reason to change.
- Make pure logic independently testable.
- Leave public behavior unchanged.
- Record the style rules in repo guidance so future work follows the same pattern.

**Non-Goals:**
- Redesign routes, payloads, or UI flows.
- Introduce a new state-management library.
- Introduce a general-purpose layering framework or dependency injection container.
- Rewrite the app around a different architecture than the current stack needs.

## Decisions

### 0. Move cross-layer API/domain contracts into a shared workspace

Decision:
- Move models that are genuinely shared by the client and server into a dedicated `shared` workspace package.
- Keep server-only transport/runtime types and client-only view/draft types in their respective apps.

Rationale:
- The current duplication is no longer just organizational noise; it creates drift risk between API producers and consumers.
- A shared workspace package keeps the contract layer explicit without mixing in framework-specific concerns.

Alternative considered:
- Keep duplicate types in each app and rely on manual synchronization. Rejected because the shapes are already overlapping enough to drift.

### 1. Organize server modules by responsibility, not by file size alone

Decision:
- Split server code into modules for:
  - domain types and constants
  - state defaults and migration
  - persistence store
  - auth/request guards
  - validation helpers
  - reward logic
  - route registration grouped by feature
  - app bootstrap

Rationale:
- This follows a stable boundary model: domain, infrastructure, and transport concerns change for different reasons.
- It avoids a false split where helpers are moved arbitrarily but domain and transport concerns remain tangled.

Alternative considered:
- Keep one `app.ts` and only extract types. Rejected because route wiring, persistence, and validation would still be coupled.

### 2. Organize client modules into app model, utilities, and view sections

Decision:
- Split client code into modules for:
  - shared app/domain types
  - constants and initial state
  - fetch helpers
  - pure view-model helpers
  - extracted UI sections/components
  - top-level app orchestration

Rationale:
- The current `App.tsx` mixes data contracts, local state transitions, and multiple large render sections.
- Extracted helpers and sections reduce cognitive load and make future feature edits more local.

Alternative considered:
- Keep all rendering in `App.tsx` and only move types/helpers. Rejected because the component would still be doing too much.

### 3. Prefer shallow, explicit folders over deep abstraction

Decision:
- Use a small number of directories with explicit names such as `domain`, `lib`, `routes`, `components`, and `features`.
- Avoid speculative layers or deep nesting.

Rationale:
- The codebase is still small. It benefits from clear separation without enterprise-style indirection.

Alternative considered:
- Introduce a more complex clean-architecture layout with ports/adapters. Rejected as disproportionate to the current app size.

### 4. Treat pure logic extraction as the main testing seam

Decision:
- Add tests for extracted pure helpers where that provides stable regression coverage.
- Keep existing end-to-end style tests to prove the refactor preserves behavior.

Rationale:
- For a refactor, the most valuable new tests are around logic moved out of large files.
- Existing integration tests already cover the preserved user behavior.

## Risks / Trade-offs

- [Risk] Over-splitting into trivial files -> Mitigation: group by responsibility, not one-symbol-per-file.
- [Risk] Import churn breaks builds -> Mitigation: refactor incrementally with existing tests and TypeScript build checks.
- [Risk] Inconsistent patterns between client and server -> Mitigation: document repository-level file-organization rules in guidance docs.

## Target Structure

Server target shape:
- `server/src/domain/*`
- `server/src/lib/*`
- `server/src/routes/*`
- `server/src/app.ts`
- `server/src/index.ts`

Client target shape:
- `client/src/app/*`
- `client/src/components/*`
- `client/src/lib/*`
- `client/src/App.tsx`
- `client/src/main.tsx`

Shared target shape:
- `shared/src/*`

## Open Questions

1. Whether the client should later move from a single top-level orchestrator to feature-level hooks.
2. Whether shared API contracts should eventually live in a cross-workspace package.
