## ADDED Requirements

### Requirement: Parent admins SHALL manage activities from a dedicated page
The system SHALL let a parent admin list, create, update, and delete activities from the activities page.

#### Scenario: Parent edits an existing routine
- **WHEN** the parent edits a step-based activity
- **THEN** the system loads the routine into the activity form and saves it through the routine update contract

#### Scenario: Parent edits an existing chore
- **WHEN** the parent edits a single-action activity
- **THEN** the system loads the chore into the activity form and saves it through the chore update contract

#### Scenario: Parent deletes an activity
- **WHEN** the parent deletes a routine or chore
- **THEN** the system removes that activity from the saved state
- **THEN** the system also removes related completion, reward, and sticker-history records
