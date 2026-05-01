## Why

The current app asks users to switch between overview, activity authoring, completion, and tablet flows, which makes the primary weekly task-tracking workflow hard to understand. The app needs a single, obvious route where a user can see the week at a glance, mark only today's tasks complete or incomplete, and immediately see celebration imagery appear in the clicked cell.

## What Changes

- Replace the current multi-route completion-first experience with a single weekly completion matrix route that shows days as columns and activities as rows.
- Highlight the current weekday and day number in the matrix and make only the current day's column interactive for marking tasks complete or undoing accidental clicks.
- Support toggling each current-day cell between incomplete and complete without requiring navigation to a separate detail view.
- Generate and display celebratory OpenAI-backed completion imagery directly inside the clicked matrix cell when a task is marked complete.
- Preserve non-blocking behavior so task completion remains usable even if cell image generation is delayed or unavailable.

## Capabilities

### New Capabilities
- `weekly-completion-matrix`: A single-route weekly matrix view for activity completion with day columns, activity rows, today highlighting, and per-cell completion toggles

### Modified Capabilities
- `workflow-navigation`: The primary household workflow changes from multiple parallel routes to a single weekly matrix-first route
- `completion-imagery`: Completion imagery is displayed inside the relevant weekly matrix cell after a completion is toggled on
- `daily-completion-view`: The separate daily completion screen is replaced by a weekly matrix interaction model

## Impact

- Affected code: client routing and layout, completion UI components, client state modeling, E2E coverage, and possibly completion-record lookup behavior
- APIs: existing completion and completion-image endpoints remain in use, but client request patterns change to per-cell toggling in the matrix
- UX: the matrix becomes the primary interaction surface, reducing route switching and hidden state
