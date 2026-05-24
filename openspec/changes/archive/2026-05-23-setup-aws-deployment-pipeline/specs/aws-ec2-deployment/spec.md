## ADDED Requirements

### Requirement: GitHub Actions SHALL deploy the production app to AWS from the main branch
The system SHALL provide a GitHub Actions workflow that validates the production app, publishes a release artifact, applies required production database migrations, and deploys that artifact to the existing Windows EC2 instance without requiring manual file copying from a developer workstation or Git operations on the production host.

#### Scenario: Main branch deployment succeeds
- **WHEN** a change is merged to the main branch
- **THEN** GitHub Actions runs the defined verification and build steps for the app
- **AND** the workflow produces a release artifact for the target build
- **AND** the workflow runs the required production migration step against the configured SQL database
- **AND** the workflow publishes the new production build artifact to the existing Windows EC2 host
- **AND** the application service is restarted or reloaded onto the new build

#### Scenario: Deployment verification fails before release
- **WHEN** the GitHub Actions workflow encounters a failing required validation step
- **THEN** the workflow does not attempt the production deployment step
- **AND** the currently running production app remains unchanged

#### Scenario: Production migration fails during deployment
- **WHEN** the GitHub Actions workflow encounters a failing production migration step
- **THEN** the workflow does not activate the new production app release
- **AND** the currently running production app remains unchanged until an operator applies a compatible fix

#### Scenario: Routine deployment uses Systems Manager remote execution
- **WHEN** the Windows EC2 instance is prepared for routine automated deployments
- **THEN** the deployment documentation identifies AWS Systems Manager as the preferred remote execution path for GitHub Actions
- **AND** interactive RDP usage is limited to initial bootstrap or break-glass recovery

### Requirement: Production hosting SHALL use the existing Windows EC2 instance behind IIS
The system SHALL support a production runtime where the existing Windows EC2 instance serves the built client application and API together, with IIS handling the public hostname and forwarding requests to the Node app on a localhost-only port.

#### Scenario: Browser opens the production hostname
- **WHEN** a browser requests the configured production subdomain
- **THEN** the request reaches IIS on the existing Windows EC2 instance
- **AND** IIS forwards the request to the Node app on the configured localhost port
- **AND** the production host returns the built client application shell for browser entry
- **AND** the same host serves the app's API routes

#### Scenario: Application host restarts
- **WHEN** the Windows EC2 instance reboots or the app process exits unexpectedly
- **THEN** the deployment documentation identifies the Windows scheduled-task startup path that restores the production app after host reboot
- **AND** the public hostname continues to target the same application host

#### Scenario: Deployment activates a new release
- **WHEN** a new production release is deployed to the Windows EC2 instance
- **THEN** the deployment process restarts the Node app using the documented Windows startup path
- **AND** the new release becomes the active app behind IIS

### Requirement: Production traffic SHALL be reachable through a Cloudflare-managed `blabberjax.com` subdomain
The system SHALL expose the production app through a dedicated `blabberjax.com` subdomain managed in Cloudflare rather than through a raw AWS host name or IP address.

#### Scenario: DNS is configured for production
- **WHEN** the production environment is prepared for first use
- **THEN** the deployment documentation identifies the Cloudflare DNS record needed for the production subdomain
- **AND** the production hostname resolves to the existing IIS origin through that Cloudflare-managed record

### Requirement: Managed generated images SHALL persist in a shared host directory across production releases
The system SHALL keep managed generated-image files in the Windows host's shared application tree so release rotation does not discard existing routine, chore, or completion images.

#### Scenario: A new production release is deployed
- **WHEN** the GitHub Actions deployment publishes a new release artifact to the Windows EC2 host
- **THEN** the deployment process preserves the managed generated-image files in the shared application tree
- **AND** the newly deployed release continues to resolve existing `/generated-assets/...` paths

#### Scenario: The first remote deployment migrates local production images
- **WHEN** the production host is receiving the initial remote deploy from the local production snapshot
- **THEN** the deployment process seeds the shared generated-image directory from the packaged local production assets
- **AND** previously created generated images remain available after cutover

### Requirement: Production persistence SHALL use the local SQL Server connection on the existing Windows host
The production deployment SHALL use the SQL Server that already runs on the existing Windows EC2 instance through environment-managed configuration and SHALL not silently fall back to file-backed JSON persistence.

#### Scenario: Production app starts with valid SQL configuration
- **WHEN** the deployed production app starts with a valid `PRESCHOOL_SQL_CONNECTION_STRING`
- **THEN** the app connects to the local production SQL Server for persistence
- **AND** the production app serves requests using SQL-backed state

#### Scenario: Production SQL configuration is missing
- **WHEN** the deployed production app starts without a valid `PRESCHOOL_SQL_CONNECTION_STRING`
- **THEN** the production app startup fails with an actionable configuration error
- **AND** the app does not switch to `server-data.json` persistence

#### Scenario: Database access stays local to the Windows host
- **WHEN** the production environment is configured
- **THEN** the deployment documentation identifies that the production app uses the SQL Server that already resides on the same Windows EC2 instance

### Requirement: IIS SHALL reverse proxy the production hostname to the Node app
The system SHALL configure IIS so the public production hostname is handled on ports `80/443` and proxied to the Node app on a localhost-only listener.

#### Scenario: Public request reaches IIS
- **WHEN** an HTTP or HTTPS request arrives for the configured production hostname
- **THEN** IIS matches the hostname binding for the app
- **AND** IIS forwards the request to the configured internal Node listener

#### Scenario: Node listener is not publicly exposed
- **WHEN** the production environment is configured
- **THEN** the deployment documentation identifies the Node app listener as an internal localhost binding rather than a public Internet endpoint
