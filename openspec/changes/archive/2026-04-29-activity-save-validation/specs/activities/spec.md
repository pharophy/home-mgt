## MODIFIED Requirements

### Requirement: Parent admins SHALL manage activities from a dedicated page
The system SHALL let a parent admin list, create, update, and delete activities from the activities page.

#### Scenario: Parent attempts to save an invalid activity
- **WHEN** the parent tries to save an activity without a name or without selecting at least one scheduled day
- **THEN** the system does not send the activity request
- **THEN** the system shows a clear validation message explaining what is required

#### Scenario: Activity save is rejected by the server
- **WHEN** the server rejects an activity save request with a validation error
- **THEN** the system shows the returned validation message instead of a generic request failure string
