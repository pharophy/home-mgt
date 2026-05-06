# weekly-completion-matrix Specification

## Purpose
Define the weekly Sticker Chart tracking surface, including matrix presentation, interaction rules, and completion-cell imagery behavior.
## Requirements
### Requirement: The system SHALL present a weekly completion matrix
The system SHALL render the primary weekly tracking surface as a clearly named Sticker Chart where weekdays are shown as columns and scheduled activities are shown as rows.

#### Scenario: Sticker Chart loads
- **WHEN** a user opens the primary completion workflow
- **THEN** the system shows a Sticker Chart with one column for each weekday and one row for each scheduled activity

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

### Requirement: The Sticker Chart SHALL surface the active child context clearly
The system SHALL make it easy for the parent/admin user to understand which child the Sticker Chart is currently showing and to switch that context without leaving the chart workflow.

#### Scenario: Parent reviews the chart for a child
- **WHEN** a parent/admin user opens the Sticker Chart
- **THEN** the system shows the active child context prominently and provides a nearby child-switching control

### Requirement: The Sticker Chart SHALL keep setup controls out of the primary chart surface
The system SHALL preserve the chart as an operational tracking surface and SHALL NOT place child-setup or activity-setup forms directly in the chart workspace.

#### Scenario: Parent uses the chart
- **WHEN** a parent/admin user is working inside the Sticker Chart
- **THEN** the system focuses on weekly tracking actions and summary context rather than showing entity-management forms on the same surface

### Requirement: The Sticker Chart SHALL show generated activity pictures for tasks and subtasks
The system SHALL display an image for each activity row and, when an activity has subtasks, a small generated picture for each step so the chart stays easy to scan without requiring manual image entry.

#### Scenario: Parent reviews the chart for a routine with steps
- **WHEN** a parent/admin user views a step-based activity in the Sticker Chart
- **THEN** the row shows the activity picture
- **THEN** each subtask is represented with its own generated picture alongside the row
- **THEN** each subtask also shows the step label next to the picture so the chart can reinforce early reading practice
- **THEN** the subtask visuals may appear in a vertical list to keep the routine sequence easy to scan
- **THEN** the pictures are generated by the LLM-backed image generator rather than by placeholder graphics
- **THEN** the user does not need to open setup to understand the step sequence visually

#### Scenario: Parent reviews the chart for a single-action activity
- **WHEN** a parent/admin user views a single-action activity in the Sticker Chart
- **THEN** the row shows the activity picture
- **THEN** the chart does not require subtask visuals for activities that have no steps

### Requirement: The Sticker Chart SHALL remain touch-friendly on tablet screens
The system SHALL adapt the weekly completion matrix for tablet interaction so the chart remains scannable, readable, and easy to tap on common portrait and landscape tablet widths.

#### Scenario: Parent views the chart on a portrait tablet
- **WHEN** a parent/admin user opens the Sticker Chart on a portrait-oriented tablet
- **THEN** the system keeps the current child context and row labels understandable while the matrix region adapts to the narrower width
- **THEN** interactive current-day cells remain easy to tap without requiring fine pointer precision

#### Scenario: Parent scrolls the chart on a tablet
- **WHEN** the matrix content requires more horizontal or vertical space than the tablet viewport comfortably provides
- **THEN** the system confines the overflow to the chart region or another clearly bounded workspace area
- **THEN** the parent does not lose the surrounding chart context while navigating the matrix

### Requirement: The Sticker Chart SHALL acknowledge completion taps immediately
The system SHALL show visible pending feedback as soon as a user taps an interactive reward target so slow sticker generation does not look like a missed interaction.

#### Scenario: User taps a current-day reward target
- **WHEN** a user taps an interactive current-day reward target on the Sticker Chart
- **THEN** the tapped cell immediately switches into a visible loading state
- **THEN** the interface communicates that sticker generation is in progress before the final celebratory sticker image is available

#### Scenario: Sticker generation is slow after a valid tap
- **WHEN** sticker generation takes noticeable time after a valid completion tap
- **THEN** the loading state remains visible in the tapped cell during the wait
- **THEN** the user does not need to tap repeatedly in order to confirm that the interaction was accepted

#### Scenario: Sticker generation is optimized for faster return
- **WHEN** the system generates the celebratory sticker image for a valid Sticker Chart completion
- **THEN** the generation path favors a faster configuration that preserves square sticker presentation and avoids a noticeable quality regression

### Requirement: Earned Sticker controls SHALL separate viewing from deletion
The system SHALL make post-generation Sticker Chart actions explicit so viewing a finished sticker does not risk deleting it.

#### Scenario: User opens an earned sticker from the Sticker Chart
- **WHEN** a user taps or clicks a finished celebratory sticker anywhere in the Sticker Chart week
- **THEN** the system opens a maximized sticker view
- **THEN** the viewing interaction does not delete the completion

#### Scenario: User removes an earned sticker from the Sticker Chart
- **WHEN** a user chooses to remove a finished current-day sticker from the Sticker Chart
- **THEN** the system exposes a distinct delete control separate from the sticker preview itself
- **THEN** the delete control remains visually secondary to the sticker artwork instead of dominating the cell
- **THEN** activating that delete control removes the completion without requiring the user to tap the sticker image itself

