## Why

The current MVP asks parents to make two upfront distinctions that are heavier than necessary: whether an adult is a caregiver with restricted access, and whether a child task should be authored as a routine versus a chore. For the current shared-tablet preschool workflow, the important boundaries are between adult setup/admin actions and the child-facing flow, and between step-based activities and single-action activities, so simplifying now reduces product and implementation complexity without closing off a future helper mode.

## What Changes

- Remove caregiver mode from the current MVP surface.
- Remove caregiver account creation and caregiver-specific handoff flows from the current MVP scope.
- Keep the MVP focused on two active interaction surfaces:
  - parent/admin setup and review
  - child/tablet execution
- Replace separate routine and chore authoring flows with a single activity creation flow.
- Define activity behavior from whether the activity has subtasks:
  - activities with subtasks behave like step-based routines
  - activities without subtasks behave like single-action chores
- Add route-based top navigation so creation, completion, and child/tablet execution live in focused, separate surfaces instead of one dense mixed screen.
- Add a dedicated task-completion view that is separate from task creation.
- Make the task-completion view show one day of tasks for one selected person at a time, including either a child or an adult household member.
- Present the completion view as task rows with:
  - an instructional picture for the task
  - an empty completion slot
  - a button on that slot that marks the task complete
- Keep the task picture as the stable instructional image for what to do.
- Allow AI to auto-generate the instructional task image from the activity description and, when present, its subtasks.
- Generate a separate custom AI completion image when a task is completed, using a configured set of child-interest-inspired themes for randomized celebratory imagery.
- Show a celebratory animation when the completion image is created, such as stars or similar upbeat background effects.
- Preserve a clear adult-versus-child boundary so child-facing flows cannot access parent/admin controls.
- Explicitly defer helper or caregiver mode to a future change when there is stronger evidence for restricted non-parent adult access.
- **BREAKING** Eliminate the current MVP expectation that the product supports a distinct caregiver role with narrower permissions than a parent.
- **BREAKING** Eliminate the current MVP expectation that routines and chores are authored through separate creation flows.

## Capabilities

### New Capabilities
- `shared-tablet-access`: Defines the MVP access model for a preschool shared-tablet experience with parent/admin access, child-facing execution, and explicit deferral of helper mode.
- `activity-authoring`: Defines a unified parent/admin authoring flow for activities with optional subtasks, schedules, approval, and rewards.
- `workflow-navigation`: Defines route-based top navigation that keeps parent/admin and child/tablet workflows focused and separated.
- `daily-completion-view`: Defines a dedicated per-person, per-day completion workspace separate from activity authoring.
- `completion-imagery`: Defines AI-generated instructional and completion imagery, celebratory reveal behavior, and prompt-safety rules based on configured task details and child-interest-inspired themes.

### Modified Capabilities
- None.

## Impact

- Affected code: client mode switching, top navigation and routing, routine/chore authoring UI, instructional image generation behavior, daily completion UI, celebration animation behavior, caregiver UI surfaces, role-aware API handling, completion handling, AI image generation integration and prompt construction, and tests that currently exercise caregiver flows or separate authoring paths.
- Affected systems: access model, authoring model, daily execution model, household role assumptions, media generation behavior, prompt-safety behavior, and future permission extensibility.
- Dependencies: should remain compatible with the preschool participation domain, but will narrow the current MVP scope and simplify later authentication decisions.
