## Context

The current preschool participation MVP includes a formal caregiver mode, caregiver creation flow, caregiver-specific completion paths, separate routine and chore authoring forms, and a single dense parent surface that mixes setup, authoring, tablet controls, and dashboard review. That design was reasonable for getting broad capability coverage into the MVP, but the current product direction favors a simpler shared-tablet workflow where the meaningful near-term boundaries are adult/admin versus child-facing execution, and step-based versus single-action activities.

This change is cross-cutting because it affects the client interaction model, route/navigation structure, route authorization assumptions, state shape, tests, and the product language used throughout the MVP. At the same time, it should not collapse the architecture into a shape that makes a future helper mode difficult to add later.

## Goals / Non-Goals

**Goals:**
- Simplify the MVP interaction model to parent/admin plus child/tablet execution.
- Remove caregiver-specific product surface area from the current MVP.
- Simplify task authoring into one parent/admin creation flow for all activities.
- Introduce route-based top navigation so each workflow is focused on one primary job at a time.
- Separate task creation from task completion so execution work happens in its own dedicated view.
- Support a daily completion view scoped to one selected person and one selected day at a time.
- Generate AI-driven completion imagery using configured child interests when tasks are marked complete.
- Allow AI to auto-generate instructional task images from the activity description and subtask details.
- Reveal generated completion imagery with a lightweight celebration animation.
- Constrain image-generation prompts so configured interests are treated as inspiration themes rather than direct copyrighted-character replication requests.
- Distinguish between instructional task images and celebratory completion images.
- Preserve an adult-versus-child safety boundary so child-facing flows cannot access admin/setup features.
- Keep implementation seams open for a future helper mode without requiring that mode now.

**Non-Goals:**
- Designing or implementing a future helper invitation or account model.
- Expanding permissions into a richer household role system.
- Eliminating all distinction between step-based and single-action activity behavior at runtime.
- Designing a general-purpose media asset pipeline beyond what is needed for completion imagery.
- Removing all actor context from the system if that would make future extension harder.
- Broadening the MVP into multi-household, co-parent, or remote sharing support.

## Decisions

### 1. Reduce the MVP role model to an adult/admin path and a child-facing path

Decision:
- Treat the current MVP as having one adult/admin experience and one child/tablet execution experience.
- Remove the explicit caregiver product role from the MVP requirements and UI.

Rationale:
- The current product value is in parent setup, child execution, and clear household scaffolding.
- A separate caregiver mode adds user-facing complexity before the product has validated that restricted adult access is important enough to justify it.

Alternative considered:
- Keep the current caregiver role as-is. Rejected because it increases scope and UX overhead without strong present evidence of value.

### 2. Preserve future extensibility by keeping access boundaries explicit

Decision:
- Keep the system conceptually organized around protected admin actions versus child-safe execution actions.
- Allow implementation to retain extension points for future actor differentiation where it does not materially complicate the simplified MVP.

Rationale:
- A future helper mode is still plausible, especially if the product later adds remote adult access or stronger adult handoff workflows.
- Preserving access seams now is cheaper than rebuilding them from scratch later.

Alternative considered:
- Flatten all access assumptions into a completely undifferentiated shared surface. Rejected because the child-facing flow still needs protection from admin/setup controls.

### 3. Prefer scope removal over partial caregiver retention

Decision:
- Remove caregiver account creation, caregiver roster management, caregiver-specific view switching, and caregiver-only messaging from the MVP instead of keeping a half-implemented restricted mode.

Rationale:
- Partial retention would preserve most of the complexity while continuing to communicate that caregiver restriction is a core MVP concept.
- A cleaner removal makes the product easier to understand and makes later helper-mode reintroduction a deliberate product decision.

Alternative considered:
- Hide some caregiver UI but keep the underlying feature as a latent MVP concept. Rejected because it creates ambiguity in both specs and implementation.

### 4. Unify routine and chore authoring into one activity flow

Decision:
- Replace separate routine and chore creation flows with one activity authoring flow for parent/admin users.
- Treat subtasks as the key branching input:
  - activities with one or more subtasks execute as step-based flows
  - activities without subtasks execute as single-action items

Rationale:
- Parents think first in terms of “a thing my child does regularly,” not “which taxonomy bucket does this belong to.”
- A unified flow removes duplicated form structure and avoids forcing an upfront routine-versus-chore decision.

Alternative considered:
- Keep separate routine and chore forms but share some UI primitives. Rejected because it preserves the main UX burden while only partially reducing implementation duplication.

### 5. Use route-based top navigation to separate workflows

Decision:
- Organize the client around explicit top-level routes or route-like navigation surfaces for the main workflows, rather than presenting all parent/admin tasks inside one mixed screen.
- Keep the number of top-level destinations small and aligned to focused jobs, such as overview, activity authoring, and tablet mode.

Rationale:
- The current mixed surface creates avoidable cognitive load and encourages context switching inside one page.
- Route-based navigation makes it easier to keep each screen focused on one workflow or one current activity at a time.

Alternative considered:
- Keep a single-page surface with only section anchors or visual grouping. Rejected because it does not create a strong enough workflow boundary for the parent/admin experience.

### 6. Separate creation and completion into different workflow surfaces

Decision:
- Keep task creation and task completion in distinct top-level workflow destinations.
- Treat completion as an operational workspace, not as a side panel attached to authoring.

Rationale:
- Creating tasks and completing tasks are different mental jobs with different frequency, urgency, and visual density.
- A separate completion workspace makes it easier to focus on “what needs to be done today” without exposing editing controls at the same time.

Alternative considered:
- Keep completion controls embedded directly into the creation screen. Rejected because it mixes setup and execution concerns and weakens the focused navigation model.

### 7. Model daily completion around one person and one day at a time

Decision:
- Scope the completion workspace to a single selected day and a single selected person at a time.
- Allow the selected person to be either a child or an adult household member.

Rationale:
- A one-person, one-day view keeps the task list legible and action-oriented.
- Supporting adult and child assignees in the completion view leaves room for a broader household participation surface without reintroducing caregiver permissions.

Alternative considered:
- Show all household tasks for all people in one daily board. Rejected because it increases clutter and makes quick completion harder.

### 8. Use row-based completion controls with post-completion AI imagery

Decision:
- Present the daily completion list as task rows containing the instructional task picture, a completion slot, and a completion action on that slot.
- When a task is completed, generate a custom AI image using the configured child interests as prompt context and randomized inspiration.
- Treat the generated completion image as a separate celebratory artifact from the instructional task picture.

Rationale:
- A row-based list is faster to scan and act on than a more decorative card layout for operational completion work.
- Interest-driven imagery turns completion into a lightweight reward moment without forcing a large separate reward economy.
- Separating instructional imagery from celebratory imagery keeps the task legible before completion and the reward expressive after completion.

Alternative considered:
- Use static completion icons only. Rejected because the requested completion experience depends on personalized generated imagery.

### 8b. Auto-generate instructional task images from activity details

Decision:
- Allow the system to generate the instructional task image from the activity description and, when present, its subtasks.
- Treat the generated instructional image as a stable representation of what to do, distinct from the celebratory completion image.

Rationale:
- Many parents will not want to source or upload task images manually for every activity.
- Activity descriptions and subtasks already contain enough semantic detail to produce a useful instructional image for preschool guidance.

Alternative considered:
- Require all instructional task images to be manually provided by the parent. Rejected because it adds authoring friction and undermines the simplification goal.

### 8a. Represent step-based activities as expandable progress rows in the completion view

Decision:
- Show each step-based activity as one activity row in the daily completion view rather than rendering all subtasks as peer rows by default.
- Allow the activity row to expose its subtask progress and completion path within that activity context.

Rationale:
- One row per activity preserves scanability in the daily list.
- Step-based activities still need progress visibility, but flattening every subtask into the main list would make the completion workspace too noisy.

Alternative considered:
- Render each subtask as an independent row in the main daily list. Rejected because it weakens the “one person, one day, one focused list” goal.

### 9. Reveal generated imagery with a lightweight completion animation

Decision:
- When the completion image is ready, reveal it with a short celebratory animation such as stars or other simple background effects.
- Keep the animation lightweight enough to feel rewarding without overwhelming the completion workflow.

Rationale:
- The generated image is more satisfying if it arrives as a reward moment rather than a silent asset swap.
- A restrained celebratory effect supports the preschool reward loop without requiring a large animation system.

Alternative considered:
- Show the generated image without any reveal treatment. Rejected because it underuses the emotional payoff of the completion moment.

### 10. Treat child interests as prompt-safe inspiration, not direct franchise reproduction

Decision:
- Store and use child interests as inspiration themes in generation prompts.
- Construct prompts to request original imagery evoking the general mood, color, subject matter, or category of the configured interests rather than direct reproduction of copyrighted characters or branded scenes.

Rationale:
- This keeps the product aligned with the user intent of personalized imagery while reducing copyright risk in generated outputs.
- Prompt-level constraints are the most direct place to shape safe generation behavior for this feature.

Alternative considered:
- Pass exact branded character requests through to image generation. Rejected because it creates unnecessary legal and policy risk.

## Risks / Trade-offs

- [Risk] Future helper mode may require reintroducing removed product concepts -> Mitigation: preserve admin-versus-child boundaries and avoid naming or data changes that prevent later role expansion.
- [Risk] Some households may want a restricted non-parent adult mode sooner than expected -> Mitigation: treat helper mode as a future additive capability and watch for user evidence before rebuilding it.
- [Risk] Simplification may remove useful attribution of which adult recorded a completion -> Mitigation: defer adult attribution requirements unless they are clearly needed for the MVP.
- [Risk] Unifying routine and chore authoring could blur useful behavioral distinctions -> Mitigation: keep runtime behavior explicit around step-based versus single-action execution, approval, and completion semantics.
- [Risk] Adding routing and top navigation could introduce structural churn in the client -> Mitigation: keep the top-level route map small and align it to already-existing workflows rather than inventing new ones.
- [Risk] AI completion image generation could add latency or reliability problems to the completion flow -> Mitigation: define the completion action first and treat generated imagery as a follow-on success artifact rather than a blocker to marking the task complete.
- [Risk] Auto-generated instructional images may not match the intended task closely enough -> Mitigation: base prompts on the activity description and subtasks, and keep the task image editable or replaceable in the authoring flow.
- [Risk] Celebration animations could become overstimulating or visually noisy -> Mitigation: keep the animation short, background-oriented, and compatible with existing gentle-celebration settings where applicable.
- [Risk] Interest-driven image generation could drift into copyrighted-character imitation -> Mitigation: enforce prompt construction rules that ask for original, inspired-by imagery instead of direct character replication.
- [Risk] Supporting adult and child assignees may widen the data model faster than planned -> Mitigation: keep the completion view person-scoped and limit the initial assignee model to what the workflow needs.
- [Risk] Existing completed change artifacts mention caregiver access heavily -> Mitigation: make this change explicitly supersede that part of MVP scope rather than trying to reinterpret old requirements informally.

## Migration Plan

1. Update specs to replace the caregiver-specific MVP model with a shared-tablet access model.
2. Update specs to replace separate routine and chore authoring with a unified activity model.
3. Add route-based workflow navigation requirements for the client.
4. Add a dedicated daily completion workflow for one person and one day at a time.
5. Define and integrate AI-generated completion imagery behavior based on configured child-interest-inspired themes.
6. Define and integrate AI-generated instructional task imagery based on activity descriptions and subtasks.
7. Add celebratory animation behavior for generated completion imagery.
8. Remove caregiver-focused UI flows and caregiver-specific authorization behavior from the implementation.
9. Consolidate authoring UI and supporting logic around activities with optional subtasks.
10. Retain or refactor only the access seams needed for parent/admin and child-safe execution.
11. Update automated tests to reflect the simplified access model, unified authoring flow, focused navigation, completion workflow, and prompt-safety behavior.

Rollback strategy:
- If simplification proves incorrect during implementation, the caregiver-specific behavior can be restored from the current MVP code and prior change artifacts, but the default plan should be to move forward with the reduced scope.

## Open Questions

1. Should the adult/admin path remain named `parent` in the product, or should it shift to broader household language later?
2. Should the future helper mode, if added, be a shared-tablet handoff mode, a separate account model, or both?
3. Is adult attribution for approvals or completions worth preserving internally even if helper mode is removed from the MVP surface?
4. Should the unified authoring language be `activity`, `task`, or another term in the product UI?
5. Should AI-generated completion imagery be persisted for later viewing, or only shown as an immediate completion-state artifact?
6. Should the celebration animation follow the existing gentle/full celebration setting, or have its own independent control?
7. Should instructional task images be regenerated automatically whenever the activity description changes, or only when explicitly requested?
