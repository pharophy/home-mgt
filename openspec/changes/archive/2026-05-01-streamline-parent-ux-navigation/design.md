## Context

The current parent/admin UX already has the required underlying capabilities, but the experience still behaves like an engineered surface rather than an intentional household-management product. The top-level layout competes for attention with decorative and secondary elements, the label `Matrix` does not communicate value, the parent dashboard panel and tablet affordances add extra destinations without improving the main planning loop, and the child/activity setup forms expose fields with uneven value density.

Current client structure also spreads the UX across several peer surfaces:
- `App.tsx` owns top-level navigation, hero chrome, success/error feedback, and route switching
- child management lives in `ChildProfilesPage`
- activity management lives in `ParentWorkspace`
- sticker history lives in `HistoryPage`
- tablet execution remains a separate child-facing capability, but it is not promoted from the parent chart surface in this revision

This is a cross-cutting UX change because it affects information architecture, naming, parent workflows, child/activity authoring, and test expectations together.

Research inputs informing the design:
- NN/g guidance emphasizes descriptive labels and stronger information scent in navigation, which argues against vague top-level names like `Matrix`.
- NN/g guidance on progressive disclosure in forms argues for hiding low-value or conditional inputs until they are useful.
- Todoist and Trello both center navigation around intent-based views and quick inline editing rather than decorative landing panels.
- Cozi's family-organizer model reinforces the value of clear family-focused destinations and person-scoped context.

## Goals / Non-Goals

**Goals:**
- Make the parent workspace legible at a glance with only three primary destinations: Sticker Chart, Setup, and History.
- Turn Setup into a clean management hub for children and activities with fast edit/update/delete actions.
- Remove top-level chrome and controls that do not materially improve task success.
- Reduce form complexity by only showing fields that matter for the current entity and current editing mode.
- Preserve current core capabilities while making them easier to discover and use.

**Non-Goals:**
- Reworking the server contract for child profiles, activities, or history.
- Reintroducing a caregiver/helper mode.
- Removing tablet mode entirely.
- Redesigning completion-imagery generation or persistence behavior.

## Decisions

### 1. Use an intent-led parent workspace with only three top-level destinations
The parent/admin workspace will expose:
- `Sticker Chart`
- `Setup`
- `History`

`Sticker Chart` becomes the default and primary operational view.

Rationale:
- These labels map to the parent's actual jobs: track, configure, review.
- This follows stronger information scent than the current `Matrix` label.
- It keeps navigation small enough to scan instantly on desktop and mobile.

Alternatives considered:
- Keep four or five peer destinations with improved labels. Rejected because it preserves too much route-level fragmentation.
- Hide history under chart overflow actions. Rejected because history is a first-class review surface requested by the user.

### 2. Remove low-value hero chrome and fold useful summary into working surfaces
The current hero panel will be removed. Any information that still matters, such as selected-child context or lightweight counts, will move into the relevant working surface header instead of occupying a decorative landing block.

Rationale:
- It reduces scroll and visual competition.
- It matches mobile-first guidance to avoid decorative imagery and oversized chrome that does not improve actionability.
- It makes the app feel more like a tool and less like a marketing page.

Alternatives considered:
- Keep the hero panel and simply reduce its size. Rejected because the core issue is not only height but weak task value.

### 3. Remove tablet launch from the parent chart surface
Tablet mode will not be promoted from the parent chart surface in this revision. The chart should stay focused on the weekly matrix and the selected child.

Rationale:
- The parent chart should stay focused on tracking, not execution entry points.
- Removing the launch action reduces parent navigation noise and avoids a mixed-purpose surface.
- The child-facing execution path can be addressed separately if it remains a supported product surface.

Alternatives considered:
- Keep a tablet launch action in Sticker Chart. Rejected because it still adds a secondary parent affordance with no clear planning value.
- Keep tablet as a top-level destination but restyle it. Rejected because the IA would still be wrong.

### 4. Consolidate child and activity administration into one Setup workspace with secondary navigation
The new Setup destination will contain two strongly labeled sections:
- `Children`
- `Activities`

Within Setup:
- the left or top section picker chooses the admin domain
- the default surface is a compact list view with row actions and an `Add new` entry point
- a focused detail/edit surface handles create/update for a single record at a time
- destructive actions stay close to the entity row, with clearer confirmations

Rationale:
- Children and activities are setup tasks, not separate primary destinations.
- This reduces top-level navigation complexity while keeping management workflows close.
- It supports fast list-to-edit transitions similar to table/list management patterns in current productivity tools.
- It removes ambiguity about which activities belong to which child by keeping the selected child context explicit in both the list and the editor.
- It makes child and activity CRUD behavior predictable by using the same interaction pattern for both entity types.

Alternatives considered:
- Keep separate top-level pages for Children and Activities. Rejected because it adds unnecessary primary-nav weight.
- Put both on one long scrolling page. Rejected because it recreates the mixed-workspace problem.

### 5. Apply progressive disclosure and field pruning by entity type
The Setup workspace will only show fields that earn their space.

Expected pruning direction:
- Child setup keeps essential identity and motivation data; low-value or unused fields such as raw avatar/photo URL should be removed or demoted unless they are actively used in the shipped UI.
- Activity setup starts with name and schedule, with other legacy toggles removed from the default form.
- Instructional preview art should be derived from the activity name instead of relying on a raw image URL field that parents must manage manually.
- The default activity form should not ask parents to manage reward or approval toggles that do not add value to the primary creation flow.
- Approval controls appear only for single-action activities.
- Step-editing controls appear only when the parent is building a step-based activity, and those controls should focus on adding, naming, and removing steps rather than editing low-value technical metadata.
- Raw instructional-image URL input should not dominate the default form; image generation or preview should be secondary.

Rationale:
- Parents should not parse fields that only apply to another entity or another activity mode.
- Progressive disclosure lowers cognitive load and makes editing faster.
- This keeps the current unified activity model while reducing visible complexity.

Alternatives considered:
- Add explicit routine-versus-chore mode selection up front. Rejected because it reintroduces taxonomy friction.
- Keep a manual image URL field plus a separate generate button. Rejected because the current control is both fragile and higher-friction than simply generating preview art after the parent finishes naming the activity.
- Keep icon and image URL fields for each subtask in the default authoring form. Rejected because they add complexity without helping the common setup path.

### 6. Make editing and updates local, visible, and low-friction
The management pattern should favor:
- row-level edit and delete actions
- one obvious `Add new` action at the top of each management list
- immediate prefilling of the selected entity in the edit surface
- visible save/cancel states
- a focused single-record editor that temporarily replaces the list while the parent edits
- automatic return to the list after save or cancel
- explicit child context next to activity creation and activity rows so the assignment model is never implicit

Rationale:
- Focused record editing reduces split attention between the list and the form while keeping the parent's mental model simple.
- It reduces the "where did my form go?" feeling when updating children and activities.
- It aligns with productivity patterns from Todoist/Trello where list context stays visible during detail editing.

Alternatives considered:
- Keep children and activities on different CRUD patterns. Rejected because the inconsistency forces the parent to relearn basic management actions by section.
- Keep the list and the full editor visible together at all times. Rejected because it creates unnecessary complexity and weakens the user's sense of "what am I editing right now?"

### 7. Make child-to-activity assignment obvious in the setup flow
The Setup workspace should make child ownership explicit at all times during activity management.

Expected behavior:
- the selected child is clearly named in the activity section header or composer
- the visible activity list reflects that selected child instead of a generic mixed list pattern
- empty states explain that activities are created for the active child
- switching children updates the visible activity set and the create/edit context together

Rationale:
- Parents should not have to infer whether an activity belongs to a child from surrounding page structure alone.
- Child-scoped management is simpler than asking the parent to mentally map entities across separate panels.

### 8. Reframe History as a scan-friendly sticker gallery
History will remain a dedicated destination but should feel like a gallery review surface:
- newest-first ordering
- clear child/activity/date metadata
- support for reviewing all generated stickers without mixing setup controls into the page

Rationale:
- The value of history is review and celebration, not management.
- Gallery-style scanning is more appropriate than generic card clutter.

## Risks / Trade-offs

- [Risk] Collapsing Children and Activities into one Setup destination could hide features if secondary navigation is weak. Mitigation: use explicit section labels and preserve deep-linkable substate where practical.
- [Risk] Removing fields too aggressively could hide edge-case capability. Mitigation: prune only fields with low present value or move them behind progressive disclosure rather than deleting underlying support immediately.
- [Risk] Moving tablet out of top-level nav could make it less discoverable for returning users. Mitigation: provide a prominent contextual launch action from Sticker Chart and document the route change in tests and release notes.
- [Risk] Large UX refactors can create regression churn in client tests. Mitigation: front-load route, form, and edit-flow integration tests before visual cleanup.

## Migration Plan

- No data migration is required.
- Update route labels and parent-facing entry points in the client.
- Adjust client tests to the new navigation model and form behavior.
- Keep legacy route handling temporarily only if needed to avoid broken deep links during rollout.

## Open Questions

- Should child avatar/photo support be fully removed from the parent form or retained behind an advanced/optional affordance?
- Should History include lightweight filters such as child chips from the first release of this UX pass, or remain newest-first only?
- Should tablet launch live in the Sticker Chart header only, or also appear in the active child context within Setup?
