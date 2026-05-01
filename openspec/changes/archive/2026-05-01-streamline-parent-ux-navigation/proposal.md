## Why

The parent/admin experience has the right building blocks, but the current UX still makes core household management feel denser and more workmanlike than it should. Navigation labels are weak (`Matrix`), low-value chrome like the hero panel consumes attention without improving task success, and children, activities, sticker history, and tablet access are not arranged around the parent's real jobs.

This change is needed now because the app already supports the primary data model and CRUD actions, so the next highest-value step is a deliberate UX pass that makes planning, editing, and reviewing feel obvious, fast, and calm. Research from current task and family organizers consistently favors strong information scent, a small number of top-level destinations, fast in-context editing, and removing decorative UI that does not help users complete their main job.

## What Changes

- Rename and restructure top-level parent navigation around clear destinations that match user intent:
  - `Sticker Chart` for the weekly completion matrix
  - `Setup` for managing children and activities
  - `History` for reviewing saved generated stickers
- Remove low-value parent chrome that adds visual weight without helping task completion, including the current hero panel, the dashboard summary panel, and tablet entry points in the parent UI.
- Make the setup experience substantially easier by turning child and activity management into a cleaner operator workflow with stronger hierarchy, better defaults, faster selection, and lower-friction edit/update actions.
- Reduce unnecessary form complexity by removing or de-emphasizing fields that do not provide enough value for the specific entity being edited.
- Improve list and detail management UX for children and activities so parents can scan, edit, update, and delete with less context switching and less repeated input.
- Replace the broken manual instructional-image flow in activity authoring by removing the raw image URL input and auto-generating the preview when the parent finishes naming the activity.
- Simplify subtask editing so parents only enter the information they actually understand and need, and remove secondary activity-form toggles that do not add value in the default flow.
- Replace the current broken activity list view with a child-scoped management pattern that makes it obvious which activities belong to which child.
- Standardize children and activities around the same CRUD UX pattern: default list view with an `Add new` action, row-level edit/delete, and a focused single-record editor that returns to the list after save or cancel.
- Keep the core parent workspace focused on planning, setup, and review instead of mixing in a separate tablet-launch affordance or dashboard panel.
- Tighten naming, layout, and visual emphasis so the sticker chart is clearly the main operational surface while setup and history remain one tap away.

## Capabilities

### New Capabilities
- `parent-ux-workspace`: A focused parent/admin workspace model that defines the information architecture, navigation, and high-efficiency management patterns for chart, setup, and history.

### Modified Capabilities
- `workflow-navigation`: The parent-facing top-level navigation and destination model will change to use clearer labels and fewer primary destinations.
- `weekly-completion-matrix`: The matrix will become the clearly named `Sticker Chart` primary surface and will absorb the most important operational emphasis.
- `activity-authoring`: Activity management requirements will change to support a much cleaner setup flow, simpler forms, and easier in-context editing.
- `preschool-participation`: Child profile management requirements will change to support simpler, faster child setup and maintenance.
- `completion-imagery`: Sticker history requirements will change to support a cleaner, more usable browsing and review experience.
- `shared-tablet-access`: Tablet access requirements will change so child/tablet entry is no longer treated as a top-level peer within the parent workspace.

## Impact

- Affected code: `client/src/App.tsx`, parent-facing components and styles, route handling, child/activity management components, and related client tests.
- APIs: no required API contract expansion is expected for the first pass, but some low-value client fields may stop being collected or emphasized.
- Dependencies: no new runtime dependencies are required; UX research should inform the design decisions and acceptance criteria.
- Systems: main OpenSpec capabilities for navigation, child setup, activity management, matrix usage, history browsing, and tablet access will all need updated behavioral contracts.
