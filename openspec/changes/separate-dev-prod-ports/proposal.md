## Why

The repository currently defaults both the production server and the development backend to port `3001`. When a production instance is already running, `npm run dev` collides with that listener and fails to start cleanly.

## What Changes

- Reserve port `3001` for the production startup path.
- Route the `npm run dev` backend to a separate default port.
- Ensure the Vite dev server proxies API and generated-asset requests to that dev backend port by default.
- Add regression coverage so the dev launcher and Vite proxy configuration keep the environments separated.

## Capabilities

### Modified Capabilities
- `local-development-runtime`: Local development startup uses a backend port that does not conflict with the production server's default listener.

## Impact

- Affected root scripts: development startup wiring.
- Affected client dev tooling: Vite proxy target defaults.
- Affected tests: regression coverage for dev startup port separation.
