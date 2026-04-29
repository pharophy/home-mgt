## ADDED Requirements

### Requirement: The MVP SHALL expose only parent/admin and child-facing interaction surfaces
The system SHALL define the preschool participation MVP around a parent/admin experience for setup and review, and a child-facing tablet experience for execution. The MVP SHALL NOT expose a distinct helper, caregiver, or non-parent adult mode.

#### Scenario: Parent opens the product for setup
- **WHEN** an adult opens the MVP to create or manage the child plan
- **THEN** the system presents the parent/admin setup and review surface without requiring a separate caregiver path

#### Scenario: Child uses the tablet flow
- **WHEN** the household opens the child-facing tablet experience
- **THEN** the system presents a child-safe execution flow without exposing a distinct helper or caregiver mode

### Requirement: Child-facing execution SHALL remain protected from admin/setup controls
The system SHALL preserve a clear access boundary between child-facing execution and parent/admin controls so the child-facing flow cannot access household setup, configuration, or approval actions.

#### Scenario: Child-facing flow is active
- **WHEN** the product is in the child-facing tablet experience
- **THEN** the system prevents access to setup, settings, approval, and other parent/admin controls

### Requirement: Helper mode SHALL be explicitly deferred rather than partially included
The system SHALL treat helper or caregiver access as out of scope for the current MVP and SHALL NOT include caregiver account creation, caregiver roster management, or caregiver-specific permissions in the current requirements.

#### Scenario: Product scope is reviewed
- **WHEN** the current MVP requirements are evaluated
- **THEN** the system behavior excludes caregiver-specific setup and restricted non-parent adult flows from the MVP contract

### Requirement: The access model SHALL remain extensible for a future helper mode
The system SHALL keep the access model organized so a future change can introduce helper-mode behavior without requiring the child-facing and parent/admin boundary to be redesigned from first principles.

#### Scenario: Future helper mode is considered
- **WHEN** a future change introduces restricted non-parent adult access
- **THEN** the existing parent/admin and child-facing boundary provides a clear extension point for that addition
