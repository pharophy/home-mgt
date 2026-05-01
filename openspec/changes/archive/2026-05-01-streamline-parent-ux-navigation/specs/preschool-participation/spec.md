## MODIFIED Requirements

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
