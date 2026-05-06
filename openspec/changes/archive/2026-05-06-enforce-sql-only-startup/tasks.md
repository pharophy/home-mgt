## 1. Regression Coverage

- [x] 1.1 Add SQL-store regression tests that fail if the raw SQL connection string is not preserved for named-instance startup
- [x] 1.2 Add startup coverage that fails if default app persistence still falls back to JSON when SQL configuration is absent

## 2. SQL-Only Startup Implementation

- [x] 2.1 Update SQL client connection initialization to use the configured connection string in a driver-compatible way
- [x] 2.2 Remove the default JSON persistence fallback from production startup paths while preserving explicit test injection seams
- [x] 2.3 Surface clear startup errors for missing or unreachable SQL persistence

## 3. Validation

- [x] 3.1 Run OpenSpec validation for `enforce-sql-only-startup`
- [x] 3.2 Run the relevant server tests covering SQL connection setup and startup behavior
