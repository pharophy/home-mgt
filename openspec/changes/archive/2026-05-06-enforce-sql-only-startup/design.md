## Context

The repository already specifies SQL-backed persistence as the durable source of truth, but the implementation still allows startup without SQL by falling back to `JsonParticipationStore`. Separately, the `MssqlParticipationClient` manually parses the configured connection string and rebuilds an object config for `mssql/msnodesqlv8`. That loses named-instance semantics because the driver internally appends either `\\instanceName` or `,port` when it builds the final ODBC string. With the current config, a server value like `.\SQLExpress` is treated as a bare server and combined with an undefined port, which prevents the production server from connecting to the running local SQL Server instance.

## Goals / Non-Goals

**Goals:**
- Make SQL Server the only persistence mode for real app startup paths.
- Preserve support for the existing `PRESCHOOL_SQL_CONNECTION_STRING` format, including named instances such as `.\SQLEXPRESS`.
- Fail fast with an actionable startup error when SQL configuration is missing or the database is unreachable.
- Keep test seams intact so unit and integration tests can still inject fake stores or fake SQL clients without requiring a live database.

**Non-Goals:**
- Changing the SQL schema or data model.
- Adding a second persistence provider or migration path away from SQL.
- Implementing background retries or connection pooling beyond what `mssql` already provides.

## Decisions

### Use the raw connection string for `msnodesqlv8` connections
`MssqlParticipationClient` will pass the configured connection string through the driver's `connectionString` field instead of reconstructing `server`, `database`, `driver`, and auth options piecemeal. This preserves named-instance syntax and lets the driver consume the exact ODBC string the user configured.

Alternative considered:
- Parse out `instanceName` and rebuild the config object correctly. Rejected because it duplicates driver parsing rules, increases edge cases around ports and additional ODBC options, and is unnecessary when the driver already supports raw connection strings.

### Split production store creation from test-only injection paths
The app should continue accepting an injected `store` or `sqlClient` for tests, but the default startup path will require `PRESCHOOL_SQL_CONNECTION_STRING`. `createParticipationStore` will no longer create a JSON store when SQL config is absent; instead it will throw a configuration error unless a test seam has supplied an explicit store or client.

Alternative considered:
- Keep the JSON fallback behind an environment flag. Rejected because it preserves ambiguity in production behavior and conflicts with the repository's SQL-only persistence requirement.

### Surface SQL configuration failures as explicit startup errors
Startup should fail with a message that explains whether the issue is missing configuration or a failed SQL connection. That keeps `npm run prod`, `npm run start`, and Windows autostart honest: if the only supported persistence layer is unavailable, the app should not limp into an unsupported mode.

Alternative considered:
- Defer the error until the first API request. Rejected because it makes production startup appear successful while guaranteeing runtime failures later.

## Risks / Trade-offs

- [Risk] Existing developer habits may rely on starting the app without SQL. -> Mitigation: keep explicit store and SQL-client injection paths for tests, and make the startup error message clear about the required environment variable.
- [Risk] Raw connection strings may include options not covered by current tests. -> Mitigation: add regression tests that assert the exact connection string is passed to `ConnectionPool`.
- [Risk] Failing fast at startup will make misconfiguration more visible. -> Mitigation: that is intentional; the app should not hide unsupported persistence modes.

## Migration Plan

Deploy the connection handling fix and SQL-only startup enforcement together. Existing SQL data remains unchanged. Rollback would restore the previous fallback behavior and broken named-instance handling, so it should only be used as an emergency measure.

## Open Questions

- None.
