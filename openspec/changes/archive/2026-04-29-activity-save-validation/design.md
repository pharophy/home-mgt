## Context

The activity builder already distinguishes between step-based routines and single-action chores, but it currently relies on server validation to reject incomplete payloads. That produces a poor parent/admin experience because obvious authoring mistakes are only surfaced after a request round-trip, and the client collapses server validation failures into a generic status message.

## Decision

Add lightweight client-side validation in the activity save handler for the two minimum authoring requirements that are already enforced by the server contract:

- activity name must be non-empty
- at least one scheduled day must be selected

Keep server-side validation as the source of truth and surface returned validation messages directly when the request is rejected.

## Rationale

- Prevents avoidable failed requests for the most common task-save mistakes
- Preserves the existing routine-versus-chore inference logic
- Improves operator feedback without changing API contracts or persistence behavior

## Non-Goals

- Reworking the activity builder layout
- Expanding validation beyond the current minimum save contract
- Changing the underlying routine or chore API model
