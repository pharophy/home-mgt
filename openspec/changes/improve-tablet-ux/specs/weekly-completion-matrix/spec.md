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
