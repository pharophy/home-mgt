## ADDED Requirements

### Requirement: Parent admins SHALL manage child profiles from a dedicated page
The system SHALL let a parent admin list, create, update, and delete child profiles from the child profiles page.

#### Scenario: Parent edits an existing child profile
- **WHEN** the parent selects an existing child profile for editing
- **THEN** the system preloads that child's current profile values into the form
- **THEN** saving updates the existing profile rather than creating a new one

#### Scenario: Parent deletes a child profile
- **WHEN** the parent deletes a child profile
- **THEN** the system removes that child profile from the saved state
- **THEN** the system also removes that child's activities, completions, rewards, and saved sticker history
