## Why

The local production server can already build and start on demand, but it still has to be launched manually after Windows boots. For a home-lab style setup, the app should come up automatically so the tablet and browser access are ready without extra steps.

## What Changes

- Add a Windows autostart registration flow for the production server.
- Provide a repeatable install/uninstall command for the startup registration.
- Start the production server automatically when the current Windows user logs in.
- Keep the existing local production pipeline intact for manual launches.

## Capabilities

### New Capabilities
- `windows-prod-startup`: Register and manage a Windows startup entry that launches the local production server after Windows boots or the user logs in.

### Modified Capabilities
- None.

## Impact

Affected areas include root scripts, Windows shell automation, and local production launch documentation. This will add a small OS-specific installer layer but should not change the application runtime itself.
