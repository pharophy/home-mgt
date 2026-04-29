## ADDED Requirements

### Requirement: The client SHALL provide top-level navigation for focused workflows
The system SHALL organize the parent/admin and child/tablet experience with explicit top-level navigation so users can move between focused workflows instead of operating from one dense mixed screen.

#### Scenario: Parent/admin user navigates between workflows
- **WHEN** a parent/admin user moves between major product areas
- **THEN** the system provides top-level navigation that clearly separates those workflows

### Requirement: Top-level navigation SHALL map to route-based workflow surfaces
The system SHALL use route-based navigation, or an equivalent route-like structure, so each major workflow has its own focused surface and state entry point.

#### Scenario: User opens a major workflow directly
- **WHEN** a user navigates to a top-level workflow destination
- **THEN** the system loads a dedicated surface for that workflow rather than scrolling the user to one section inside a mixed page

### Requirement: Parent/admin workflows SHALL remain focused on one primary job at a time
The system SHALL structure top-level parent/admin destinations so each destination emphasizes one main workflow, such as overview, activity authoring, daily completion, or child/tablet execution.

#### Scenario: Parent/admin user opens activity authoring
- **WHEN** a parent/admin user enters the activity authoring destination
- **THEN** the system emphasizes activity creation and editing without mixing in unrelated primary workflows on the same surface

#### Scenario: Parent/admin user opens daily completion
- **WHEN** a parent/admin user enters the daily completion destination
- **THEN** the system emphasizes task execution and completion for the selected person and day without mixing in creation controls on the same surface

### Requirement: Child/tablet execution SHALL remain a distinct focused destination
The system SHALL keep the child/tablet execution experience separate from parent/admin authoring and review surfaces within the top-level navigation model.

#### Scenario: Household opens child/tablet execution
- **WHEN** the product enters the child-facing tablet execution destination
- **THEN** the system presents the child-facing execution flow as a distinct focused surface apart from parent/admin setup and review

### Requirement: The system SHALL expose dedicated parent management pages
The system SHALL provide dedicated parent-facing pages for child profiles, activities, the weekly completion matrix, and sticker history.

#### Scenario: Parent navigates the main application
- **WHEN** a parent admin opens the app
- **THEN** the system shows navigation for child profiles, activities, weekly matrix, and history
- **THEN** the weekly matrix is the default page

### Requirement: The weekly matrix page SHALL remain focused on completion tracking
The system SHALL keep child-profile CRUD and activity-builder forms off the weekly matrix page.

#### Scenario: Parent views the weekly matrix
- **WHEN** the parent opens the matrix page
- **THEN** the system shows the weekly completion matrix workflow
- **THEN** the system does not show the child profile form or the activity builder on that page
