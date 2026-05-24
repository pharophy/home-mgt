## MODIFIED Requirements

### Requirement: The server SHALL initialize and evolve the SQL schema needed for the MVP through versioned migrations
The system SHALL ensure the required SQL tables and later schema changes for the preschool participation MVP are managed through versioned SQL migrations so an empty database can be initialized and an existing database can be advanced to the required schema version before the app handles requests.

#### Scenario: API starts against an empty SQL database
- **WHEN** the server starts with a valid SQL connection string pointing at an empty database
- **THEN** it can apply the baseline required migrations idempotently
- **THEN** normal read and write routes can operate without requiring a manually pre-created schema

#### Scenario: Deployment includes pending schema changes
- **WHEN** a production deployment includes unapplied SQL migrations
- **THEN** the deployment process applies those migrations before switching the app to the new release
- **AND** the new release is not activated until the migration step succeeds

#### Scenario: Migration step fails during deployment
- **WHEN** the deployment process encounters a failing SQL migration
- **THEN** the deployment reports a migration failure and stops before activating the new app release
- **AND** operators can keep the previous running release in place while resolving the schema issue
