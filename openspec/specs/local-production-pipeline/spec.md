# local-production-pipeline Specification

## Purpose
TBD - created by archiving change local-production-pipeline. Update Purpose after archive.
## Requirements
### Requirement: Local production launch pipeline
The system SHALL provide a local production launch path that builds the client and server and then starts the production server from the repository.

#### Scenario: Developer starts the production pipeline
- **WHEN** a developer runs the documented production launch command from the repository root
- **THEN** the client and server production outputs are built
- **AND** the production server starts after the build completes

#### Scenario: Windows developer runs the production pipeline through npm
- **WHEN** a Windows developer runs the documented production launch command through an npm script
- **THEN** the launcher reuses the active npm CLI or a valid npm executable path for child steps
- **AND** the build and start steps do not fail because `npm.cmd` could not be spawned from the launcher

### Requirement: Production server serves the built client
The system SHALL serve the compiled client application and static assets from the production server when the built client output is available.

#### Scenario: Browser loads the production app
- **WHEN** a browser requests the app from the production server
- **THEN** the server returns the built client application shell
- **AND** the client assets are served from the local build output

### Requirement: SPA routes resolve in production
The production server SHALL return the client application shell for non-API browser routes so direct navigation and refresh work in production.

#### Scenario: Direct navigation to a client route
- **WHEN** a browser requests a non-API route handled by the client application
- **THEN** the production server returns the client application shell instead of a 404

### Requirement: Production host and port are configurable
The production server SHALL bind to a configurable host and port so the app can be accessed from the local machine and, when desired, the local network.

#### Scenario: Developer overrides the bind address
- **WHEN** a developer sets host or port environment variables before starting the production server
- **THEN** the production server binds to the configured address

