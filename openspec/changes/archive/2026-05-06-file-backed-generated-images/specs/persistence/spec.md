## MODIFIED Requirements

### Requirement: The participation data model SHALL persist to SQL
The system SHALL persist the preschool participation data model in SQL tables rather than a local JSON snapshot file, and generated activity or completion image fields SHALL persist managed same-origin asset references rather than inline generated-image payloads.

#### Scenario: Server loads current household state
- **WHEN** the API loads household state
- **THEN** it reads child profiles, routines, chores, completions, rewards, and household settings from SQL-backed persistence

#### Scenario: Parent/admin records or updates participation data
- **WHEN** a parent/admin creates or updates child profiles, activities, completions, approvals, or settings
- **THEN** the server saves those changes to SQL-backed persistence
- **THEN** a subsequent server restart can reload the same data from SQL

#### Scenario: Generated image fields are persisted
- **WHEN** generated instructional or completion images are saved with participation state
- **THEN** SQL-backed persistence stores managed same-origin asset references for those image fields
- **THEN** SQL-backed persistence does not depend on inline generated-image payloads remaining in those fields

### Requirement: The server SHALL initialize the SQL schema needed for the MVP
The system SHALL ensure the required SQL tables for the preschool participation MVP exist before handling requests.

#### Scenario: API starts against an empty SQL database
- **WHEN** the server starts with a valid SQL connection string pointing at an empty database
- **THEN** it initializes the required MVP tables idempotently
- **THEN** normal read and write routes can operate without requiring a manually pre-created schema
