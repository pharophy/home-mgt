## ADDED Requirements

### Requirement: Instructional image generation SHALL NOT block activity save
The system SHALL allow a parent/admin user to save a valid activity immediately even when the instructional task image or generated step thumbnails are still being created.

#### Scenario: Parent saves a new activity while images are still generating
- **WHEN** a parent/admin user completes the required activity fields and saves while generated instructional imagery is still pending
- **THEN** the system saves the activity without waiting for image generation to finish
- **THEN** the system continues generating and persisting the instructional image assets after the activity record has been saved

#### Scenario: Generated instructional image finishes after save
- **WHEN** background instructional image generation completes for an already-saved activity
- **THEN** the system persists the generated activity image and any generated step thumbnails onto that saved activity
- **THEN** subsequent loads show the saved generated imagery without requiring the parent to recreate the activity

### Requirement: Pending image generation SHALL be visible to the parent
The system SHALL show explicit generating-image placeholders anywhere newly requested task imagery is still pending so the user can understand that artwork is on the way.

#### Scenario: Parent sees a task preview while generation is pending
- **WHEN** the system has requested an instructional image or step thumbnail that is not yet ready
- **THEN** the interface shows a visible generating placeholder instead of a blank or broken image area
- **THEN** the generating state remains distinguishable from a permanent image failure state

#### Scenario: Image generation fails after save
- **WHEN** instructional image generation does not complete successfully after the task has already been saved
- **THEN** the activity remains saved
- **THEN** the interface shows an unavailable-image state rather than reverting or losing the saved task
