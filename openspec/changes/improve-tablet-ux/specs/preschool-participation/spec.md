## ADDED Requirements

### Requirement: The child-facing tablet stage SHALL adapt across tablet orientations
The system SHALL keep the child-facing active-task surface easy to understand and complete in both portrait and landscape tablet orientations.

#### Scenario: Child views the active task in portrait orientation
- **WHEN** the child-facing tablet experience is shown in portrait orientation
- **THEN** the system keeps the current task art, label, progress, and completion action in a vertically legible flow
- **THEN** the primary completion action remains fully visible without requiring precise scrolling

#### Scenario: Child views the active task in landscape orientation
- **WHEN** the child-facing tablet experience is shown in landscape orientation
- **THEN** the system uses the wider space to keep the task prominent without shrinking the main touch target below an easy-tap size
- **THEN** the child still experiences one dominant next action rather than multiple competing controls
