## Context

The repository currently treats port `3001` as the default listener for both the production server and the development backend. That makes `npm run dev` fragile whenever a production instance is already running, even though the client dev server only needs a reachable backend target and does not require the same port as production.

## Decision

1. Keep port `3001` reserved for the production startup path.
   - This preserves the current production URL and the Windows autostart behavior.

2. Introduce a dedicated root dev launcher that starts the backend on port `3002` by default.
   - The launcher can inject the backend port for the server workspace without relying on shell-specific environment syntax.
   - The launcher should derive the default client proxy target from the backend port so the two dev processes stay aligned.

3. Keep explicit overrides authoritative.
   - If `PORT` or `VITE_API_TARGET` is already set, the dev launcher should preserve those values instead of forcing its defaults.

## Alternatives Considered

- Change the server's global default port based on runtime mode.
  Rejected because production startup does not consistently set a mode flag, so this would make the production default less explicit.

- Keep the existing root `concurrently` script and require developers to set ports manually.
  Rejected because the conflict would remain the default behavior and Windows-specific env syntax would still be awkward.

## Risks

- Developers who run the client workspace by itself may still expect the backend on `3001`.
  Mitigation: set the Vite proxy default to `3002` and document the split in the README.
