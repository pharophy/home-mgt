## ADDED Requirements

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
