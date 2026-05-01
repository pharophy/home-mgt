## ADDED Requirements

### Requirement: The system SHALL present a weekly completion matrix
The system SHALL render a weekly matrix where weekdays are shown as columns and scheduled activities are shown as rows.

#### Scenario: Weekly matrix loads
- **WHEN** a user opens the primary completion workflow
- **THEN** the system shows a matrix with one column for each weekday and one row for each scheduled activity

### Requirement: The system SHALL highlight the current day in the matrix
The system SHALL visually emphasize the current weekday and calendar day number within the matrix.

#### Scenario: User views the matrix during the week
- **WHEN** the matrix is rendered for the current week
- **THEN** the system highlights the current weekday column header and shows the current day number with it

### Requirement: Only the current day column SHALL be directly interactive
The system SHALL allow users to click completion cells only in the current weekday column.

#### Scenario: User inspects a non-current day column
- **WHEN** the user views cells for any weekday other than the current weekday
- **THEN** those cells are read-only and do not allow direct completion toggling

### Requirement: Current-day matrix cells SHALL toggle completion on and off
The system SHALL allow a user to mark a current-day activity cell complete and to unmark that same cell if the completion was accidental.

#### Scenario: User toggles a current-day activity cell
- **WHEN** the user clicks a current-day cell for a scheduled activity
- **THEN** the system toggles that activity's completion state for the current day between incomplete and complete

### Requirement: Interactive incomplete cells SHALL use reward-style completion icons
The system SHALL present an incomplete current-day cell with an empty reward-style icon, such as an empty star or empty sticker, instead of plain completion text so the cell visually invites clicking.

#### Scenario: User views an incomplete interactive cell
- **WHEN** the current-day cell is scheduled and not yet complete
- **THEN** the system shows an empty star or empty sticker style affordance inside that clickable cell rather than the word `Complete`
- **THEN** the empty reward affordance is centered inside the same visual frame that will later display the generated completion image
- **THEN** the system includes a clear visible cue that the live reward target should be tapped or clicked

### Requirement: Scheduled non-current cells SHALL use muted reward placeholders
The system SHALL show scheduled but non-interactive matrix cells as muted reward placeholders instead of verbose schedule copy.

#### Scenario: User views a future scheduled cell
- **WHEN** an activity is scheduled for a non-current day column and that cell is not directly interactive
- **THEN** the system shows a centered, greyed-out reward placeholder within the cell
- **THEN** the system does not render `Scheduled for ...` helper text inside that cell

### Requirement: Completed matrix cells SHALL display celebratory imagery in place
The system SHALL display generated celebratory completion imagery inside the matrix cell that was marked complete.

#### Scenario: User completes a current-day activity
- **WHEN** the user toggles a current-day activity cell to complete
- **THEN** the system displays the generated celebration image inside that cell when it becomes available
