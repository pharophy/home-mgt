## ADDED Requirements

### Requirement: Parents can create a preschool child profile
The system SHALL allow a parent to create and manage a child profile optimized for a 4-year-old, including a display name, avatar or photo, and a display color used throughout the child-facing experience.

#### Scenario: Parent creates a child profile
- **WHEN** a parent completes the child profile form with the required fields
- **THEN** the system creates a child profile that can be used in routines, chores, and tablet mode

### Requirement: Parents can define visual routines
The system SHALL allow a parent to create recurring routines composed of ordered visual steps suitable for a non-reader child.

#### Scenario: Parent creates a routine with ordered steps
- **WHEN** a parent creates a routine and adds one or more ordered steps with icons, photos, or short labels
- **THEN** the system stores the routine in step order for future execution

#### Scenario: Parent schedules a recurring routine
- **WHEN** a parent assigns recurrence metadata to a routine
- **THEN** the system includes that routine in the child's applicable daily plan

### Requirement: Parents can define age-appropriate chores
The system SHALL allow a parent to create simple chores for a preschool child, including recurrence, optional approval, and optional reward value.

#### Scenario: Parent creates a recurring chore
- **WHEN** a parent creates a chore with recurrence and assigns it to the child
- **THEN** the system makes the chore available in the child's active plan on the appropriate days

#### Scenario: Parent requires approval for a chore
- **WHEN** a parent marks a chore as requiring approval
- **THEN** the system records the chore as pending parent confirmation after the child marks it complete

### Requirement: The child-facing tablet mode is non-reader friendly
The system SHALL present routines and chores in a tablet mode that does not require reading fluency and emphasizes one main action at a time.

#### Scenario: Child views an active routine step
- **WHEN** the child opens tablet mode and has an active routine
- **THEN** the system shows the current step with large touch targets and clear visual cues

#### Scenario: Child completes a step
- **WHEN** the child taps to complete the current step
- **THEN** the system advances progress and shows immediate completion feedback

### Requirement: The system records completion history
The system SHALL record routine step, routine, and chore completion activity so that parents can review what was completed and when.

#### Scenario: Parent reviews today's participation
- **WHEN** a parent opens the dashboard after routines or chores have been attempted
- **THEN** the system shows completed items, incomplete items, and any items that required help or approval

### Requirement: The system supports lightweight rewards
The system SHALL support simple preschool-appropriate rewards such as stars or stickers without requiring a complex economy.

#### Scenario: Completion awards a reward
- **WHEN** a child completes a configured routine or chore and any required approval is satisfied
- **THEN** the system records and displays the configured star or sticker reward

#### Scenario: Household disables overstimulating celebration
- **WHEN** a parent turns off enhanced celebration effects
- **THEN** the system still confirms success without using the disabled effect style
