# workflow-navigation Specification

## Purpose
Define the top-level navigation model that separates focused parent/admin and child/tablet workflows into clear destinations.
## Requirements
### Requirement: The client SHALL provide top-level navigation for focused workflows
The system SHALL organize the parent/admin and child/tablet experience with explicit top-level navigation that uses descriptive, task-oriented labels and separates the parent’s primary jobs into a small number of focused destinations.

#### Scenario: Parent/admin user navigates between workflows
- **WHEN** a parent/admin user moves between major product areas
- **THEN** the system provides top-level navigation with clearly descriptive labels for the parent’s primary workflows
- **THEN** the system avoids vague destination names that do not communicate the job of the surface

### Requirement: Top-level navigation SHALL map to route-based workflow surfaces
The system SHALL use route-based navigation, or an equivalent route-like structure, so each major workflow has its own focused surface and state entry point.

#### Scenario: User opens a major workflow directly
- **WHEN** a user navigates to a top-level workflow destination
- **THEN** the system loads a dedicated surface for that workflow rather than scrolling the user to one section inside a mixed page

### Requirement: Parent/admin workflows SHALL remain focused on one primary job at a time
The system SHALL structure top-level parent/admin destinations so each destination emphasizes one main workflow, such as weekly tracking, household setup, or sticker review, without mixing unrelated primary jobs on the same surface.

#### Scenario: Parent/admin user opens the setup destination
- **WHEN** a parent/admin user enters the setup destination
- **THEN** the system emphasizes child and activity management without mixing the sticker review gallery or child-execution surface into that same primary workspace

#### Scenario: Parent/admin user opens the sticker chart
- **WHEN** a parent/admin user enters the primary tracking destination
- **THEN** the system emphasizes the weekly sticker chart workflow rather than setup forms or decorative landing content

### Requirement: Child/tablet execution SHALL remain a distinct focused destination
The system SHALL keep the child/tablet execution experience separate from parent/admin authoring and review surfaces within the overall navigation model, while not requiring tablet mode to remain a top-level parent navigation item.

#### Scenario: Household opens child/tablet execution
- **WHEN** the product enters the child-facing tablet execution destination
- **THEN** the system presents the child-facing execution flow as a distinct focused surface apart from parent/admin setup and review

#### Scenario: Parent views top-level navigation
- **WHEN** a parent/admin user views the primary workspace navigation
- **THEN** the system does not present tablet execution as a peer top-level destination alongside the parent’s primary planning, setup, and review surfaces

### Requirement: The system SHALL expose dedicated parent management pages
The system SHALL provide dedicated parent-facing destinations for Sticker Chart, Setup, and History.

#### Scenario: Parent navigates the main application
- **WHEN** a parent admin opens the app
- **THEN** the system shows navigation for Sticker Chart, Setup, and History
- **THEN** the Sticker Chart is the default destination

### Requirement: The weekly matrix page SHALL remain focused on completion tracking
The system SHALL keep child-profile CRUD and activity-builder forms off the weekly matrix page.

#### Scenario: Parent views the weekly matrix
- **WHEN** the parent opens the matrix page
- **THEN** the system shows the weekly completion matrix workflow
- **THEN** the system does not show the child profile form or the activity builder on that page

### Requirement: Parent sticker chart shall not carry secondary dashboard or tablet launch actions
The system SHALL keep the Sticker Chart surface focused on the matrix and the selected-child context, without a separate summary dashboard panel or a tablet-launch action in the primary parent UI.

#### Scenario: Parent opens Sticker Chart
- **WHEN** a parent/admin user enters the Sticker Chart
- **THEN** the system does not show a separate parent dashboard panel on that surface
- **THEN** the system does not show a tablet launch action on that surface

