## Why

Local server startup currently fails against Windows-auth SQL connection strings even when `PRESCHOOL_SQL_CONNECTION_STRING` is present and valid for ODBC. The SQL connection builder removes authentication-related ODBC flags from the connection string before passing it to `mssql/msnodesqlv8`, which breaks local integrated-auth startup and makes the effective credentials differ from the configured credentials.

## What Changes

- Preserve authentication and trust-related ODBC flags in the connection string that is passed to `mssql/msnodesqlv8`.
- Keep the parsed connection options aligned with the same connection string so SQL-auth and Windows-auth startup both work.
- Add regression coverage for Windows-auth and SQL-auth connection-string handling.

## Capabilities

### Modified Capabilities
- `persistence`: SQL-backed startup preserves the intended authentication mode from `PRESCHOOL_SQL_CONNECTION_STRING` instead of altering it before connection.

## Impact

- Affected server startup and persistence wiring: `server/src/lib/sql-store.ts`
- Affected server regression coverage: `server/src/lib/sql-store.test.ts`
