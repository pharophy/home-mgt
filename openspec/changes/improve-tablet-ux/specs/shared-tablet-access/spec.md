## ADDED Requirements

### Requirement: Shared-tablet handoff SHALL protect parent context while remaining easy to reverse
The system SHALL support a quick parent-to-child handoff on a shared tablet while keeping parent/admin state recoverable only through an intentional exit from child-facing mode.

#### Scenario: Parent hands the tablet to the child
- **WHEN** a parent/admin user enters the child-facing tablet experience from the shared device
- **THEN** the active child-facing surface hides setup, history, and other parent/admin controls
- **THEN** the previous parent/admin context remains recoverable after an intentional exit path

#### Scenario: Child-facing session is active
- **WHEN** the child-facing tablet experience is on screen
- **THEN** the system does not expose ambient parent/admin navigation alongside the child task surface
- **THEN** leaving the child-facing surface requires a deliberate transition rather than accidental activation during normal child use
