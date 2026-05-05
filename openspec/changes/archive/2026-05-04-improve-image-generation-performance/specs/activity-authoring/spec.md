## MODIFIED Requirements

### Requirement: Unified activity authoring SHALL support the existing recurring participation needs
The single activity creation flow SHALL support the core parent/admin inputs needed for household participation, including scheduling, while only showing fields that are useful for the current activity shape.

#### Scenario: Parent configures recurring activity details
- **WHEN** a parent/admin user completes the unified activity creation flow
- **THEN** the system allows the activity to include schedule information needed for execution
- **THEN** the system does not force the parent to interpret fields that are irrelevant to the current entity or current activity mode

#### Scenario: Parent finishes naming an activity
- **WHEN** a parent/admin user enters an activity name and leaves that field with a non-empty value
- **THEN** the system automatically requests an instructional preview image for that activity from the LLM-backed image generator
- **THEN** the system does not require the parent to paste a raw image URL or click a separate generate button to get the preview

#### Scenario: Parent does not manage rewards in the activity form
- **WHEN** a parent/admin user creates or edits an activity
- **THEN** the system does not show a separate reward type or reward amount control in the default form
- **THEN** the completion sticker experience remains automatic and separate from activity authoring

#### Scenario: Parent saves while instructional imagery is still pending
- **WHEN** a parent/admin user saves a valid activity before the generated instructional image or step thumbnails are ready
- **THEN** the system saves the activity immediately
- **THEN** the interface continues to show a generating-image state until the saved activity imagery is later available
- **THEN** save and error feedback remain visibly on screen even when the parent has scrolled down in the workspace

#### Scenario: Saved activity artwork appears later on the Sticker Chart
- **WHEN** a parent/admin user saves a valid activity before its generated instructional artwork has finished
- **THEN** the activity still appears immediately in the saved household data
- **THEN** background image generation continues after the save completes
- **THEN** once the generated artwork is persisted, the Sticker Chart shows the new activity image without requiring the parent to recreate the activity

### Requirement: Existing activities gain generated image assets
The system SHALL generate missing instructional artwork for saved routines and chores without blocking the parent from continuing to use the activity-management workspace.

#### Scenario: Existing activities gain generated image assets
- **WHEN** the system loads an existing routine or chore that does not yet have generated artwork
- **THEN** the system generates the missing image assets
- **THEN** the generated artwork is written back to the saved activity record so it is available on future loads
- **THEN** the visible activity-management workspace remains usable while the generation work is still pending
