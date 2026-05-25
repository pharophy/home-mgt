## MODIFIED Requirements

### Requirement: The participation data model SHALL persist to SQL
The system SHALL persist the preschool participation data model in SQL tables rather than a local JSON snapshot file, and generated activity or completion image fields SHALL persist managed same-origin asset references rather than inline generated-image payloads.

#### Scenario: Server starts with Windows-auth SQL configuration
- **WHEN** the API starts with a valid `PRESCHOOL_SQL_CONNECTION_STRING` that uses Windows authentication such as `Trusted_Connection=Yes`
- **THEN** the server preserves that authentication mode when opening the SQL connection
- **AND** startup does not rewrite the connection string into one that loses the intended credentials

#### Scenario: Server starts with SQL-auth SQL configuration
- **WHEN** the API starts with a valid `PRESCHOOL_SQL_CONNECTION_STRING` that uses explicit SQL credentials
- **THEN** the server preserves those SQL-auth credentials and trust settings when opening the SQL connection
- **AND** startup does not strip the flags needed for the configured connection mode
