# preschool-participation Specification

## Purpose
Define the core preschool participation model for child profiles, recurring routines and chores, child-facing execution, completion history, and lightweight rewards.
## Requirements
### Requirement: Parents can create a preschool child profile
The system SHALL allow a parent to create and manage a child profile optimized for a 4-year-old, using a lightweight setup flow that emphasizes only the child information that materially affects planning, chart context, history, or child-facing execution.

#### Scenario: Parent creates a child profile
- **WHEN** a parent completes the child profile form with the required fields
- **THEN** the system creates a child profile that can be used in routines, chores, and tablet mode
- **THEN** the default create flow emphasizes only the high-value child fields needed for current product behavior

#### Scenario: Parent edits an existing child profile
- **WHEN** the parent selects an existing child profile for editing
- **THEN** the system preloads that child's current profile values into the form
- **THEN** saving updates the existing profile rather than creating a new one
- **THEN** the parent can return to the surrounding child-management context without losing orientation

#### Scenario: Parent wants to add another child after one already exists
- **WHEN** the parent is viewing the saved child list
- **THEN** the system shows an obvious `Add new child` action above the list
- **THEN** choosing that action opens a focused child editor for a new record rather than requiring the parent to infer how to re-open the create flow

#### Scenario: Parent deletes a child profile
- **WHEN** the parent deletes a child profile
- **THEN** the system removes that child profile from the saved state
- **THEN** the system also removes that child's activities, completions, rewards, and saved sticker history

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

