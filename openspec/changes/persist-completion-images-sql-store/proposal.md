## Why

The weekly matrix currently treats generated celebration images as transient client state, so they disappear on reload even when the completion itself remains recorded. At the same time, the server still persists the preschool participation data model to a local JSON file rather than to SQL, which blocks durable multi-session use and makes the completion-image behavior unreliable.

## What Changes

- Persist generated celebration image metadata on the completion record so completed tasks continue showing their saved image after reload.
- Remove the saved image when that completion is unmarked or deleted.
- Introduce a SQL-backed participation store for household settings, child profiles, routines, chores, completions, and rewards.
- Keep the client matrix behavior intact while hydrating saved completion artwork from persisted server state.

## Impact

- Affected code: shared completion/state types, client matrix hydration logic, server completion-image route/service flow, server persistence layer, and server integration tests.
- APIs: completion-image requests will need to identify which completion record should receive the generated image.
- Data: the persistence model moves from JSON-file state snapshots to relational SQL tables.
