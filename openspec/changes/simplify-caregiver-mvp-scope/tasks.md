## 1. Spec And Access Model Alignment

- [x] 1.1 Remove caregiver-specific language and assumptions from the active MVP implementation plan where this change now supersedes them
- [x] 1.2 Define the simplified runtime access model around parent/admin and child-facing execution only
- [x] 1.3 Define the unified activity model around optional subtasks instead of separate routine and chore authoring paths
- [x] 1.4 Define the daily completion model around one person and one day at a time, with configured child-interest themes for completion imagery

## 2. Client Navigation And Workflow Focus

- [x] 2.1 Add route-based top navigation for creation, completion, and child/tablet workflows
- [x] 2.2 Remove caregiver mode switching, caregiver setup UI, and caregiver-specific messaging from the client
- [x] 2.3 Preserve the child-facing tablet flow while ensuring admin/setup controls remain outside the child experience

## 3. Unified Activity Authoring

- [x] 3.1 Replace separate routine and chore creation surfaces with one activity authoring flow
- [x] 3.2 Implement activity behavior that branches on whether subtasks are present
- [x] 3.3 Preserve assignee selection, scheduling, approval, and reward behavior within the unified authoring flow
- [x] 3.4 Add AI generation support for instructional task images from activity descriptions and subtask details

## 4. Daily Completion Workflow

- [x] 4.1 Build a completion view separate from task creation
- [x] 4.2 Scope the completion view to one selected person and one selected day at a time
- [x] 4.3 Render completion rows with task picture, empty completion slot, and row-level completion action
- [x] 4.4 Trigger AI-generated completion imagery from configured child-interest-inspired themes when a task is marked complete
- [x] 4.5 Reveal generated completion imagery with a lightweight celebration animation
- [x] 4.6 Constrain image-generation prompts to original inspired-by imagery rather than direct copyrighted-character reproduction
- [x] 4.7 Ensure task completion succeeds even when completion imagery is delayed or unavailable

## 5. Server Simplification And Access Boundaries

- [x] 5.1 Remove caregiver-specific routes and authorization behavior that are no longer part of the MVP contract
- [x] 5.2 Retain only the access seams needed to separate parent/admin actions from child-facing execution actions

## 6. Verification

- [x] 6.1 Replace caregiver-focused automated tests with tests for the simplified parent/admin and child-facing access model
- [x] 6.2 Add or update tests for unified activity authoring and route-based workflow navigation
- [x] 6.3 Add or update tests for the dedicated daily completion view and person/day filtering
- [x] 6.4 Add or update tests for completion-triggered AI imagery behavior, celebratory reveal animation, and prompt-safety rules
- [x] 6.5 Add or update tests for non-blocking completion recording when imagery is delayed or unavailable
- [x] 6.6 Add or update tests for AI-generated instructional task images and their prompt inputs
- [x] 6.7 Run the relevant client and server test suites and confirm the simplified MVP behavior matches the updated spec
- [x] 6.8 Add a browser E2E harness for the parent/admin, completion, and tablet workflows
- [x] 6.9 Add end-to-end coverage for child setup, unified activity authoring, completion imagery, and tablet execution
- [x] 6.10 Run the browser E2E suite against the integrated client/server app
