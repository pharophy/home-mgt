## Context

The current client centers the parent/admin experience around multiple top-level routes: overview, activities, completion, and tablet. The completion route then narrows the task list to one selected person and one selected day at a time. That is structurally clean, but it makes the core household workflow harder to follow because users must mentally combine schedule context, current day context, and completion actions across separate screens. The user request is to collapse the interaction into one obvious matrix where the week is visible at once, today's column is visually emphasized, and only today's cells can be toggled.

The existing backend already records completions with `scheduledDay` and already exposes a completion-image endpoint that returns OpenAI-backed imagery without blocking completion recording. That means the main work is client workflow simplification, matrix state modeling, and completion toggle semantics.

## Goals / Non-Goals

**Goals:**
- Provide one primary route that displays a weekly activity matrix with weekdays as columns and activities as rows.
- Highlight the current weekday and calendar day number in the matrix.
- Allow completion toggling only in the current day's column.
- Support accidental-click recovery by allowing a current-day completed cell to be toggled back to incomplete.
- Display generated celebratory imagery inside the completed matrix cell while preserving pending and unavailable states.

**Non-Goals:**
- Rework activity authoring in this change beyond whatever is needed to feed the matrix.
- Preserve the existing multi-route parent/admin workflow model as the primary UX.
- Introduce long-term persistence for generated images beyond the current completion state already handled by the client.
- Enable editing historical or future-day completions directly from non-current columns.

## Decisions

### Make the weekly matrix the single primary parent/admin route
The client will move from a navigation-first workflow to a matrix-first workflow. Activity authoring can remain available as a secondary surface, but the main route rendered on load will be the weekly completion matrix.

Rationale:
- The user’s complaint is about confusing UX, not missing backend capability.
- A matrix gives schedule context and completion context in one place.

Alternatives considered:
- Keep the current route structure and add a matrix as one more screen: rejected because it increases navigation instead of simplifying it.

### Model matrix rows as scheduled activity entries and columns as fixed weekdays
Each row represents an activity scheduled for at least one day in the week. Each cell reflects whether that activity applies on that weekday and, if it does, whether it is complete.

Rationale:
- The user asked for activities as rows and days as columns.
- This layout allows us to reuse routine/chore schedule data directly.

Alternatives considered:
- One row per step or chore occurrence: rejected because it would make the matrix too dense and violate the requested mental model.

### Restrict interaction to the current weekday column
Only cells in the current weekday column will be clickable. Scheduled cells in other columns render as read-only planned work.

Rationale:
- This matches the requested behavior exactly.
- It avoids reopening the broader design question of editing past/future completions.

Alternatives considered:
- Allow past-day corrections: rejected for now because the request is specifically “only column allowing a user to click.”

### Toggle completion by diffing existing state rather than adding a new completion status
The client will treat a current-day cell as complete if a matching completion exists for that activity and day. Clicking an incomplete cell will create a completion. Clicking a complete cell will remove that completion through a dedicated toggle endpoint or delete-style action.

Rationale:
- The user explicitly wants accidental unmark support.
- This is simpler than inventing a second “unchecked” event model in the UI.

Alternatives considered:
- Append a reversal event while preserving the original completion: viable, but more complex than needed for the first pass.

### Reuse the existing completion-image backend and display imagery inside the cell
When a current-day cell is toggled to complete, the client will request OpenAI-backed completion imagery and render the resulting image directly inside that matrix cell with the existing celebratory animation class.

Rationale:
- The backend capability already exists and satisfies the user’s “LLM is called and generates an image” requirement.
- Rendering inside the cell keeps the reward moment attached to the interaction point.

Alternatives considered:
- Show the image in a side panel or modal: rejected because the user asked for it to display in that cell.

## Risks / Trade-offs

- [Risk] A weekly matrix can become visually dense as activities grow. -> Mitigation: keep row content minimal and treat instructional visuals as optional or secondary in the matrix.
- [Risk] Toggling complete/incomplete requires removing an existing completion, which the current API does not yet support. -> Mitigation: add a focused completion-toggle endpoint or delete route with day-scoped matching semantics.
- [Risk] Generated images may overwhelm the matrix layout if they are full-size. -> Mitigation: constrain imagery to a compact cell preview with fixed dimensions.
- [Risk] Current-day-only interaction may frustrate users who expect to correct prior days. -> Mitigation: implement the requested behavior exactly first and revisit historical editing only if needed.
