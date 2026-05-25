## ADDED Requirements

### Requirement: Production managed generated images SHALL resolve to the shared application tree
Managed generated images in production SHALL be written under `app/shared/generated-assets` so they survive release rotation.

#### Scenario: Server starts from the workspace directory inside a deployed release
- **WHEN** the server process runs from `app/current/server` or another nested path inside the deployed application tree
- **THEN** managed generated images resolve to `app/shared/generated-assets`
- **AND** newly saved generated images survive release replacement

#### Scenario: Development has no shared application tree
- **WHEN** the application runs outside the deployed application tree and no shared directory exists
- **THEN** the system may fall back to a local `generated-assets` directory
