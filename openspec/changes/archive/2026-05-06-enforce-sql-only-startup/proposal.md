## Why

The production server is currently reconstructing a `msnodesqlv8` config object from the SQL connection string, which breaks named-instance startup for the configured `.\SQLEXPRESS` database and causes production launches to die even though SQL Server is running. The app also still falls back to JSON persistence when no SQL connection string is present, which contradicts the repository's SQL-backed persistence requirement and makes startup behavior inconsistent.

## What Changes

- Fix SQL startup so the server uses the configured SQL connection string in a way that reliably supports named SQL Server instances on Windows.
- Remove the JSON persistence fallback from normal app startup and require SQL-backed persistence unless a test injects an explicit store or SQL client.
- Fail startup with a clear, actionable error when SQL persistence is not configured or cannot be reached.
- Keep the existing local production pipeline pointed at the SQL-backed server so `npm run prod` and related startup paths always exercise the only supported persistence mode.

## Capabilities

### New Capabilities

### Modified Capabilities
- `persistence`: Server startup and persistence initialization must require SQL-backed storage and connect reliably to named SQL Server instances.
- `local-production-pipeline`: The production launch path must start the SQL-backed server and fail clearly when SQL configuration or connectivity is invalid.

## Impact

- Affected server code: SQL connection initialization, participation store creation, and startup wiring.
- Affected production behavior: `npm run prod`, `npm run start`, and Windows autostart now depend on a working SQL connection instead of silently allowing JSON-backed startup.
- Affected tests: SQL store regression coverage and app startup failure coverage need updates.
