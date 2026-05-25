## MODIFIED Requirements

### Requirement: Completed matrix cells SHALL display celebratory imagery in place
The system SHALL display generated celebratory completion imagery inside the matrix cell that was marked complete, and the weekly Sticker Chart SHALL only treat completions from the visible calendar week as eligible to fill that week's cells.

#### Scenario: User completes a current-day activity
- **WHEN** the user toggles a current-day activity cell to complete
- **THEN** the system displays the generated celebration image inside that cell when it becomes available

#### Scenario: User opens the chart later in the same week
- **WHEN** the Sticker Chart loads and a matching completion was recorded earlier in the visible calendar week
- **THEN** the system rehydrates that saved celebratory image into the corresponding weekday cell for the same week

#### Scenario: Prior-week completion matches the same weekday
- **WHEN** the Sticker Chart loads for the current week and a saved completion exists for the same child, activity, and weekday from an earlier calendar week
- **THEN** the system does not treat that prior-week completion as filling the current week's cell
- **THEN** a future scheduled cell in the current week remains a muted placeholder instead of showing the old sticker
