## 1. Regression Coverage

- [x] 1.1 Add a regression test that fails if the development launcher does not assign a non-production backend port
- [x] 1.2 Add a client regression test that fails if the Vite dev proxy does not target the dev backend port by default

## 2. Dev/Prod Port Separation

- [x] 2.1 Update the root development startup path so the backend runs on a dedicated default dev port while production keeps `3001`
- [x] 2.2 Update the Vite dev proxy configuration to target the dedicated dev backend port by default
- [x] 2.3 Update local documentation to clarify the separate dev and production ports

## 3. Validation

- [x] 3.1 Run OpenSpec validation for `separate-dev-prod-ports`
- [x] 3.2 Run the relevant script and client regression tests
