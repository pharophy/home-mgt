## MODIFIED Requirements

### Requirement: The MVP SHALL expose only parent/admin and child-facing interaction surfaces
The system SHALL define the preschool participation MVP around a parent/admin experience for setup and review, and a child-facing tablet experience for execution. The MVP SHALL NOT expose a distinct helper, caregiver, or non-parent adult mode, and SHALL NOT require tablet mode to occupy a top-level parent workspace slot.

#### Scenario: Parent opens the product for setup
- **WHEN** an adult opens the MVP to create or manage the child plan
- **THEN** the system presents the parent/admin setup and review surface without requiring a separate caregiver path

#### Scenario: Child uses the tablet flow
- **WHEN** the household opens the child-facing tablet experience
- **THEN** the system presents a child-safe execution flow without exposing a distinct helper or caregiver mode
- **THEN** the parent does not need a permanent top-level tablet navigation item in order to reach that flow
