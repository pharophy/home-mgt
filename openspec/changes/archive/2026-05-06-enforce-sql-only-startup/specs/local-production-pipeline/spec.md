## MODIFIED Requirements

### Requirement: Local production launch pipeline
The system SHALL provide a local production launch path that builds the client and server and then starts the SQL-backed production server from the repository.

#### Scenario: Developer starts the production pipeline
- **WHEN** a developer runs the documented production launch command from the repository root
- **THEN** the client and server production outputs are built
- **AND** the production server starts after the build completes

#### Scenario: Windows developer runs the production pipeline through npm
- **WHEN** a Windows developer runs the documented production launch command through an npm script
- **THEN** the launcher reuses the active npm CLI or a valid npm executable path for child steps
- **AND** the build and start steps do not fail because `npm.cmd` could not be spawned from the launcher

#### Scenario: Production launch is missing SQL configuration
- **WHEN** a developer runs the production launch command without a configured SQL connection string
- **THEN** the production server does not start in a JSON-backed fallback mode
- **AND** the command fails with an actionable SQL configuration error
