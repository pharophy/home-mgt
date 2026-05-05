## ADDED Requirements

### Requirement: The system SHALL provide a secondary tablet handoff path
The system SHALL allow a parent/admin user to enter and exit the child-facing tablet experience through a secondary control that preserves the parent workflow context without promoting tablet mode to a top-level destination.

#### Scenario: Parent launches child-facing tablet mode
- **WHEN** a parent/admin user chooses the tablet handoff control from a parent-facing workspace
- **THEN** the system enters the child-facing tablet experience for the currently selected child
- **THEN** the system preserves the parent user's current destination and child context for return later

#### Scenario: Parent exits child-facing tablet mode
- **WHEN** the parent intentionally exits the child-facing tablet experience
- **THEN** the system returns the parent to the previously active parent-facing destination
- **THEN** the previously selected child context is still active after the return
