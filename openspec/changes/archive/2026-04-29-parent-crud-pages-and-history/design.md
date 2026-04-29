## Context

The app already has the data model needed for a cleaner parent workflow:
- child profiles
- routines
- chores
- completions with persisted celebration imagery
- rewards

What it lacks is a UX and API shape that treats those models as first-class entities. Today:
- the matrix page still contains setup and dashboard concerns
- child profiles can only be created, not updated or deleted
- routines can be edited but not deleted
- chores can be created but not edited or deleted
- saved celebration images are durable, but there is no dedicated history page to browse them

This change restructures the parent experience around four pages while preserving the existing tablet flow and weekly matrix behavior.

## Goals / Non-Goals

**Goals**
- Give parent admins a dedicated page for managing child profiles.
- Give parent admins a dedicated page for managing activities across routines and chores.
- Keep the weekly matrix page focused on completion tracking.
- Expose a dedicated sticker history page built from persisted completion imagery.
- Extend the server contract so the client can update and delete the entities it manages.
- Keep the persistence model centered on the existing SQL-backed participation state.

**Non-Goals**
- Introduce pagination, filtering, or search for history.
- Preserve completion history after the parent deletes the source child profile or activity.
- Redesign tablet mode beyond keeping it compatible with the refactor.

## Decisions

### Use explicit top-level parent routes
The client will expose separate routes for:
- `children`
- `activities`
- `matrix`
- `history`

The weekly matrix remains the default route.

Rationale:
- It removes the current mixed-mode workspace.
- It gives each page one clear responsibility.
- It matches the user request directly.

### Keep sticker history derived from completions
The history page will read from `state.completions` and show only completions with `celebrationImageUrl`.

For each history entry, the UI will show:
- sticker image
- child name
- activity label
- completion time
- saved theme when available

Rationale:
- completion already owns the sticker lifecycle
- no extra persistence model is needed
- deleting a completion naturally removes its sticker from history

### Support CRUD through route-specific API extensions
The server will add:
- `PATCH /api/child-profiles/:childProfileId`
- `DELETE /api/child-profiles/:childProfileId`
- `PATCH /api/chores/:choreId`
- `DELETE /api/chores/:choreId`
- `DELETE /api/routines/:routineId`

Existing `PATCH /api/routines/:routineId` remains the routine update path.

Rationale:
- the client already distinguishes routines and chores
- the API stays small and predictable
- it avoids inventing a synthetic merged activity resource

### Cascade deletes to keep SQL state coherent
Deleting a child profile will also delete:
- its routines
- its chores
- its completions
- its rewards

Deleting a routine will also delete:
- completions recorded for that routine
- completions recorded for its routine steps
- rewards sourced from those routine completions

Deleting a chore will also delete:
- completions recorded for that chore
- rewards sourced from those chore completions

Rationale:
- it prevents orphaned completion or reward rows
- it keeps history aligned with the current entity graph
- it is simpler than introducing archive semantics for this pass

## UX Structure

### Child Profiles page
- list all child profiles as cards or rows
- create a new child profile
- edit an existing child profile inline or through a prefilling form
- delete a child profile with an explicit delete action

### Activities page
- list routines and chores for the selected child
- create routines and chores from the existing unified activity builder
- edit either type by preloading the form
- delete either type from the list

### Weekly Matrix page
- keep the matrix as the main completion surface
- remove child profile setup and activity editor controls from this page
- keep quick context such as selected child and summary metrics if helpful, but not CRUD forms

### History page
- show saved completion stickers in reverse chronological order
- include context for child, activity, and completion time
- show an empty state when no stickers exist

## Risks / Trade-offs

- [Risk] Cascading deletes remove sticker history. Mitigation: make the spec explicit and keep the behavior predictable.
- [Risk] Activity edit behavior spans two entity types. Mitigation: keep one client form shape but route writes to the correct endpoint.
- [Risk] Route cleanup could regress matrix or tablet flows. Mitigation: cover route navigation and CRUD behavior in client integration tests before refactoring.
