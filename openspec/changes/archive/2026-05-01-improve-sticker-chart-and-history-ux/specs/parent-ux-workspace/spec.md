## MODIFIED Requirements

### Requirement: The Sticker Chart surface SHALL avoid a separate dashboard panel
The system SHALL keep the Sticker Chart surface centered on the weekly matrix and selected-child context rather than presenting a separate parent dashboard panel, and SHALL use the page header area in a compact way that maximizes the chart footprint.

#### Scenario: Parent views the chart surface
- **WHEN** a parent/admin user opens Sticker Chart
- **THEN** the system does not present a separate dashboard panel below or beside the matrix
- **THEN** the selected-child controls and week context are arranged so they do not leave a large unused area beside the header content
- **THEN** the page allocates the recovered space to the chart and its content-bearing rows instead of decorative neutral layout blocks

## ADDED Requirements

### Requirement: Sticker Chart header controls SHALL feel holistically integrated
The system SHALL present the child selector, current week context, and any chart-level supporting controls as one coherent header composition that feels intentional across desktop and mobile layouts.

#### Scenario: Parent scans the top of Sticker Chart
- **WHEN** a parent/admin user first lands on the Sticker Chart
- **THEN** the top layout reads as one coherent chart header rather than a disconnected child section followed by the chart
- **THEN** the layout uses the available horizontal space intentionally without awkward half-width orphaning
- **THEN** the design still preserves clear affordances for switching the active child
