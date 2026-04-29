## 1. Domain and API foundation

- [x] 1.1 Define server-side domain models for household roles, child profiles, routines, routine steps, chores, completions, and rewards
- [x] 1.2 Create persistence schema and migrations for the preschool participation entities
- [x] 1.3 Implement API endpoints for creating and listing child profiles, routines, and chores
- [x] 1.4 Implement API endpoints for recording completions, approvals, and rewards
- [x] 1.5 Implement role-aware authorization for parent and caregiver actions

## 2. Parent authoring experience

- [x] 2.1 Build parent flows for creating a child profile with avatar/photo and display color
- [x] 2.2 Build parent flows for creating and editing visual routines with ordered steps
- [x] 2.3 Build parent flows for creating recurring chores with optional approval and rewards
- [x] 2.4 Build a parent dashboard for today's routines, chores, completions, and pending approvals

## 3. Child tablet mode

- [x] 3.1 Build a dedicated child-facing tablet mode with one active task at a time
- [x] 3.2 Implement step progression, progress indicators, and completion feedback for routines
- [x] 3.3 Implement child-friendly chore completion flow in tablet mode
- [x] 3.4 Add configurable celebration behavior that supports gentle feedback mode

## 4. Caregiver access

- [x] 4.1 Build caregiver invitation or creation flow with limited permissions
- [x] 4.2 Build caregiver views for the child's current plan and completion recording
- [x] 4.3 Enforce restricted access for household settings and parent-only controls

## 5. Validation and refinement

- [x] 5.1 Add tests for role permissions, routine recurrence resolution, and completion recording
- [x] 5.2 Add tests for parent approval and reward issuance behavior
- [x] 5.3 Validate the end-to-end morning routine and cleanup flows against the spec scenarios
- [x] 5.4 Update product documentation and onboarding copy to reflect the preschool participation focus

## 6. Archive readiness fixes

- [x] 6.1 Add regression tests for routine editing, reward authoring, and parent completion review
- [x] 6.2 Implement parent editing for ordered visual routines, including icons or photos
- [x] 6.3 Implement parent reward authoring for chores and configured routines
- [x] 6.4 Implement dashboard review of completed items, incomplete items, and approvals/help state
- [x] 6.5 Re-run relevant tests and archive-readiness verification for this change
