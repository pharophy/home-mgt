## 1. Regression Coverage

- [x] 1.1 Add a failing server regression test for Windows-auth SQL connection-string handling
- [x] 1.2 Add a failing server regression test for SQL-auth connection-string handling

## 2. SQL Startup Fix

- [x] 2.1 Update SQL connection-string handling so startup preserves the configured authentication mode
- [x] 2.2 Keep the parsed connection options aligned with the same connection string behavior

## 3. Validation

- [x] 3.1 Run the relevant server regression coverage for SQL connection-string handling
- [x] 3.2 Validate the change with `openspec validate preserve-sql-auth-flags-on-startup --type change --strict --no-interactive`
