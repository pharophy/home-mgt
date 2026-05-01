## 1. Research and acceptance framing
- [x] 1.1 Capture the UX rationale in the change artifacts around descriptive navigation, progressive disclosure, and in-context editing for parent setup workflows.
- [x] 1.2 Confirm the scope of low-value fields and chrome to remove or demote, including the hero panel, tablet top-level nav, and low-value child/activity inputs.

## 2. Navigation and information architecture
- [x] 2.1 Add or update failing client tests for the parent top-level navigation so the default destination is `Sticker Chart` and the primary parent destinations are only `Sticker Chart`, `Setup`, and `History`.
- [x] 2.2 Update the parent workspace routing and navigation labels to match the new information architecture and remove hero-panel-first layout behavior.
- [x] 2.3 Remove tablet launch from the primary parent navigation and Sticker Chart surface.

## 3. Setup workspace UX
- [x] 3.1 Add or update failing client tests for the new Setup destination covering section switching between `Children` and `Activities`, preserved list context while editing, and entity-specific form visibility.
- [x] 3.2 Refactor the parent management surface into a single Setup workspace with clear secondary navigation for `Children` and `Activities`.
- [x] 3.3 Simplify child management by pruning or demoting low-value fields and making create/edit/delete actions easier to scan and complete.
- [x] 3.4 Simplify activity management with progressive disclosure so only relevant fields appear for single-action versus step-based activities.
- [x] 3.5 Remove the manual instructional image URL field and generate button, then auto-generate the activity preview when the parent leaves the activity-name field with a valid name.
- [x] 3.6 Remove the activity reward selector, reward amount fields, and approval checkbox from the default authoring flow.
- [x] 3.7 Replace raw subtask icon/image inputs with simple add/remove step rows that only ask for the step name in the default flow.
- [x] 3.8 Replace the current activity list pattern with a child-scoped management view that makes activity ownership and the active child explicit.
- [x] 3.9 Standardize child and activity CRUD around the same list-first pattern: `Add new` action above the list, row-level edit/delete, and a focused single-record editor that returns to the list after save or cancel.
- [x] 3.10 Show automatically generated step thumbnails alongside each step in the routine editor.

## 4. History and polish
- [x] 4.1 Add or update failing client tests for the History destination so saved stickers are shown in a dedicated review surface without setup controls mixed in.
- [x] 4.2 Refine the History destination into a clean newest-first gallery with clear metadata and stronger scanability.
- [x] 4.3 Remove obsolete tablet, dashboard, and hero styles plus other low-value parent chrome that no longer supports the new UX.

## 5. Verification
- [x] 5.1 Run `npm test --workspace client`.
- [x] 5.2 Run `openspec validate streamline-parent-ux-navigation --type change --strict --no-interactive`.

## 6. Sticker chart imagery
- [x] 6.1 Regenerate generated pictures for activity rows and subtasks in the Sticker Chart so the chart shows visual thumbnails for tasks and step sequences.
- [x] 6.2 Show routine step labels next to each step picture in the Sticker Chart, using a vertical list so the sequence supports reading practice.
- [x] 6.3 Route activity and step image generation through the LLM-backed server image generator instead of local placeholder SVG generation.
- [x] 6.4 Include parent auth headers on instructional-image requests and persist generated step thumbnails back into the saved activity draft.
- [x] 6.5 Backfill existing routines and chores with persisted generated images when the app loads records that still lack them.
