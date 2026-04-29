## ADDED Requirements

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
