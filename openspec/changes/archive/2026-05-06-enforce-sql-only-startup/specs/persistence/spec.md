## MODIFIED Requirements

### Requirement: The participation data model SHALL persist to SQL
The system SHALL persist the preschool participation data model in SQL tables rather than a local JSON snapshot file, and normal application startup SHALL require SQL-backed persistence to be configured.

#### Scenario: Server loads current household state
- **WHEN** the API loads household state
- **THEN** it reads child profiles, routines, chores, completions, rewards, and household settings from SQL-backed persistence

#### Scenario: Parent/admin records or updates participation data
- **WHEN** a parent/admin creates or updates child profiles, activities, completions, approvals, or settings
- **THEN** the server saves those changes to SQL-backed persistence
- **THEN** a subsequent server restart can reload the same data from SQL

#### Scenario: Startup is missing SQL configuration
- **WHEN** the server starts without a configured SQL connection string and no test-only store override is provided
- **THEN** startup fails before serving requests
- **THEN** the error explains that SQL-backed persistence configuration is required

### Requirement: The server SHALL initialize the SQL schema needed for the MVP
The system SHALL ensure the required SQL tables for the preschool participation MVP exist before handling requests, using the configured SQL connection string in a way that supports named SQL Server instances.

#### Scenario: API starts against an empty SQL database
- **WHEN** the server starts with a valid SQL connection string pointing at an empty database
- **THEN** it initializes the required MVP tables idempotently
- **THEN** normal read and write routes can operate without requiring a manually pre-created schema

#### Scenario: API starts against a named SQL Server instance
- **WHEN** the server starts with a valid SQL connection string that targets a named SQL Server instance such as `.\SQLEXPRESS`
- **THEN** the SQL client connects using that configured instance
- **THEN** normal schema initialization and request handling can proceed
