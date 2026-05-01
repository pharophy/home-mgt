## ADDED Requirements

### Requirement: Task completion SHALL have a dedicated workflow separate from task creation
The system SHALL provide a task-completion workflow that is separate from the activity authoring workflow.

#### Scenario: Parent/admin user switches from creation to completion
- **WHEN** a parent/admin user navigates from activity authoring to task completion
- **THEN** the system opens a dedicated completion surface instead of mixing completion controls into the creation flow

### Requirement: The completion view SHALL show one day of tasks for one person at a time
The system SHALL scope the task-completion view to a single selected day and a single selected person at a time, where the selected person MAY be a child or an adult household member.

#### Scenario: User selects a person and day
- **WHEN** a user opens the completion workflow and chooses a person and a day
- **THEN** the system shows only the tasks assigned to that person for that day

### Requirement: The completion view SHALL render tasks as actionable rows
The system SHALL render the daily task list as rows that include an instructional task picture, a completion slot, and a completion action on that slot.

#### Scenario: User views the daily completion list
- **WHEN** the completion workflow loads tasks for the selected person and day
- **THEN** each task row shows the task picture and an empty completion slot that functions as the button for marking the task complete

### Requirement: Step-based activities SHALL remain grouped in the completion view
The system SHALL present a step-based activity as one activity row in the daily completion view, with subtask progress handled inside that activity context rather than flattening all subtasks into peer rows by default.

#### Scenario: User views a step-based activity in the daily list
- **WHEN** the selected person and day include an activity with subtasks
- **THEN** the system shows one row for the activity and exposes subtask progress or completion within that activity row context

### Requirement: Completion actions SHALL mark the task complete from the row control
The system SHALL allow the user to mark a task complete by activating the completion slot button in the task row.

#### Scenario: User completes a task from the row
- **WHEN** the user activates the empty completion slot for a task row
- **THEN** the system records that task as completed for the selected person and day
