# local-development-runtime Specification

## Purpose
Define the local development startup contract so development services do not conflict with production-oriented listeners on the same machine.

## Requirements
### Requirement: Local development startup SHALL avoid the production listener
The system SHALL start the local development backend on a default port that does not conflict with the production server's default port.

#### Scenario: Production server is already running on the default production port
- **WHEN** a developer runs `npm run dev` from the repository root while the production server is already listening on `3001`
- **THEN** the development backend starts on its own default port instead of trying to bind `3001`
- **AND** the client development server continues reaching the backend without requiring manual port overrides

#### Scenario: Developer overrides the backend target explicitly
- **WHEN** a developer sets an explicit development backend target or port before running `npm run dev`
- **THEN** the development startup path respects that override
- **AND** production startup behavior remains unchanged
