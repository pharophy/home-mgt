## MODIFIED Requirements

### Requirement: Task completion SHALL be handled from a weekly matrix instead of a separate daily workflow
The system SHALL provide task completion through a weekly matrix surface rather than through a separate completion workflow detached from the weekly schedule context.

#### Scenario: Parent/admin user performs weekly task tracking
- **WHEN** a parent/admin user needs to review and mark work for the week
- **THEN** the system presents task completion controls inside the weekly matrix instead of opening a separate daily completion screen

### Requirement: The completion surface SHALL show week context with activities as rows and weekdays as columns
The system SHALL scope the completion surface to one visible week at a time, with activities as rows and weekdays as columns, while only the current day remains interactive.

#### Scenario: User views the weekly completion surface
- **WHEN** the weekly completion matrix loads
- **THEN** the system shows the week's scheduled activities in a row-and-column matrix and restricts direct toggling to the current weekday column

### Requirement: Completion actions SHALL be triggered from matrix cells
The system SHALL allow the user to mark or unmark a task by activating the corresponding current-day matrix cell.

#### Scenario: User interacts with today's cell
- **WHEN** the user activates the current-day cell for a scheduled activity
- **THEN** the system toggles that task's completion state for today from the cell itself
