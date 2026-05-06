# tablet-device-ux Specification

## Purpose
TBD - created by archiving change improve-tablet-ux. Update Purpose after archive.
## Requirements
### Requirement: Shared tablet surfaces SHALL use touch-first ergonomics
The system SHALL present tablet-class surfaces with touch-sized controls, safe-area-aware spacing, and reachable primary actions while preserving the same workflows and information architecture used on desktop.

#### Scenario: User interacts with a primary tablet action
- **WHEN** a parent/admin user or child uses a primary action on a tablet-oriented surface
- **THEN** the control presents a touch-friendly target size rather than a mouse-sized button or icon
- **THEN** the action remains visually prominent within the active working region
- **THEN** the workflow behavior of that action matches the corresponding desktop surface

#### Scenario: Tablet surface reaches the viewport edge
- **WHEN** a shared-device surface is displayed on a tablet with device insets or browser chrome reducing the usable viewport
- **THEN** the system preserves safe-area-aware padding around interactive controls
- **THEN** the outermost actionable controls do not sit flush against the physical screen edge

### Requirement: Tablet layouts SHALL keep primary actions reachable while content scrolls
The system SHALL keep the main action for the current workspace accessible without requiring the user to repeatedly scroll to the far top or bottom of a long workspace.

#### Scenario: Parent works in a long tablet form
- **WHEN** a parent/admin user scrolls through a long Setup or review workspace on a tablet
- **THEN** the system keeps the relevant primary action region reachable through a sticky or otherwise persistent affordance
- **THEN** the preserved action region does not obscure the final form fields or content rows

#### Scenario: User stays in the same workflow across device sizes
- **WHEN** the same workspace is used on desktop and tablet-sized screens
- **THEN** the system preserves the same route-level workflow and available actions
- **THEN** only layout and ergonomic presentation differ between device sizes

