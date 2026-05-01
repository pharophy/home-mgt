## Context

Today the client creates a completion record first and then requests celebratory imagery separately. The generated image is stored only in ephemeral client state, which means refreshing the page or reloading application state loses the image even though the completion remains recorded. Separately, `createApp()` is hard-wired to `JsonParticipationStore`, so all domain state is persisted to `server-data.json`.

The requested change has two coupled parts:

1. Treat saved celebration imagery as durable completion data that survives reloads and is cleared when the completion is removed.
2. Replace the JSON-file persistence path with a SQL-backed participation store built around the current preschool participation entities.

## Goals / Non-Goals

**Goals**
- Persist generated completion imagery against the recorded completion.
- Rehydrate saved completion imagery into the weekly matrix without forcing regeneration.
- Delete saved completion imagery when a completion is unmarked.
- Persist the participation model to SQL tables instead of a JSON snapshot file.
- Keep the route-level API contract small and close to the current client behavior.

**Non-Goals**
- Build a generic migration runner framework beyond what is needed for this MVP.
- Add historical image versioning or multiple images per completion.
- Rework the weekly matrix interaction model beyond the persistence behavior.

## Decisions

### Persist celebration image fields on the completion entity
The shared `Completion` type will gain optional persisted celebration-art fields:
- `celebrationImageUrl`
- `celebrationPrompt`
- `celebrationTheme`
- `celebrationGeneratedAt`

Rationale:
- The lifecycle matches the completion record exactly.
- Unmarking a task already deletes the completion record, so the saved image naturally disappears too.
- The client can hydrate saved art from `state.completions` without a second lookup model.

Alternatives considered:
- Separate completion-art table exposed as a second API payload: rejected because it adds hydration complexity without a different lifecycle.

### Make `/api/completion-images` update a recorded completion
The completion-image route will require `completionId` in addition to the existing prompt inputs. The server will generate the image, persist the image fields on the matching completion record, and return the saved art payload.

Rationale:
- The server must know which durable completion row to update.
- This preserves the current two-step client workflow while making the second step durable.

Alternatives considered:
- Generate the image inside `POST /api/completions`: rejected because completion recording must remain non-blocking when generation is delayed or unavailable.

### Introduce a relational SQL participation store
The server persistence abstraction will move from `read()/write(state)` snapshot semantics to a domain-oriented store API that can be backed by SQL tables. The SQL store will model:
- household settings
- child profiles
- routines
- routine steps
- chores
- completions
- rewards

Rationale:
- A relational model is the correct fit for entity-oriented participation state and completion history.
- Snapshot write semantics are awkward and inefficient once SQL becomes the durable backend.

Alternatives considered:
- Store one large JSON blob in SQL: rejected because it would not meaningfully improve the data model and would keep the same snapshot-coupled behavior.

### Keep tests fast by allowing injectable store implementations
`createApp()` will accept an injected participation repository/store so server tests can use an in-memory implementation while production paths use SQL.

Rationale:
- Server tests should not depend on a live SQL Server instance.
- This keeps TDD practical while still delivering a real SQL-backed default path.

## Data Model

### Tables

`household_settings`
- `id` primary key
- `celebration_mode`

`child_profiles`
- `id` primary key
- `name`
- `avatar_url`
- `color`
- `motivators_json`
- `created_at`
- `updated_at`

`routines`
- `id` primary key
- `child_profile_id`
- `name`
- `image_url`
- `schedule_days_json`
- `reward_type`
- `reward_amount`
- `created_at`
- `updated_at`

`routine_steps`
- `id` primary key
- `routine_id`
- `label`
- `icon`
- `image_url`
- `step_order`

`chores`
- `id` primary key
- `child_profile_id`
- `name`
- `image_url`
- `recurrence_days_json`
- `requires_approval`
- `reward_type`
- `reward_amount`
- `created_at`
- `updated_at`

`completions`
- `id` primary key
- `item_type`
- `item_id`
- `child_profile_id`
- `scheduled_day`
- `parent_entity_type`
- `parent_entity_id`
- `status`
- `recorded_by_id`
- `recorded_by_role`
- `completed_at`
- `approved_at`
- `approved_by_id`
- `approved_by_role`
- `celebration_image_url`
- `celebration_prompt`
- `celebration_theme`
- `celebration_generated_at`

`rewards`
- `id` primary key
- `child_profile_id`
- `source_type`
- `source_id`
- `completion_id`
- `reward_type`
- `amount`
- `awarded_at`

### Schema management

The SQL store will ensure required tables exist on startup using idempotent DDL. This keeps local setup simple for the MVP without introducing a separate migration tool yet.

## Risks / Trade-offs

- [Risk] Refactoring away from snapshot persistence touches many routes. Mitigation: introduce a narrow repository interface and convert route handlers incrementally behind tests.
- [Risk] SQL setup differs across environments. Mitigation: use one explicit connection-string environment variable and keep tests on an in-memory store.
- [Risk] Persisted base64 image data can grow table size. Mitigation: store only one current completion image per completion and delete it when the completion is removed.
