## Context

The repository already has a working local production pipeline that builds the client and server and then starts the production server on demand. What is missing is a Windows-specific autostart path so the same local production instance comes up automatically after the current user logs in.

This change is operational rather than product-facing. It affects root-level scripts, a small Windows startup helper, and local documentation. It should not change the production runtime itself or the manual `npm run prod` path.

## Goals / Non-Goals

**Goals:**
- Automatically start the production server for the current Windows user after logon.
- Provide install and uninstall commands so the autostart registration is repeatable and removable.
- Keep the autostart implementation local-machine friendly and avoid admin-only setup.
- Preserve the existing manual production pipeline unchanged.

**Non-Goals:**
- No Windows service installation.
- No machine-wide startup registration.
- No change to the server runtime, client build, or application behavior.
- No cross-platform autostart support beyond a clean unsupported-platform message.

## Decisions

1. Use the current user's Windows Run key for logon autostart.
   - This is simpler and more reliable than building a custom Startup-folder shortcut or service wrapper for a local machine.
   - It avoids admin-only setup and does not require the app to run as a service.

2. Launch the existing production pipeline from a thin Windows wrapper.
   - The wrapper changes to the repository root and invokes the same production command used manually.
   - This keeps startup behavior aligned with the already validated production path.

3. Provide explicit install and uninstall scripts.
   - The user should be able to register and remove startup behavior without editing files by hand.
   - The scripts should be idempotent so rerunning install updates the existing registration.

4. Treat non-Windows execution as unsupported for the autostart commands.
   - The production pipeline itself remains cross-platform.
   - The autostart registration is intentionally Windows-specific and should fail fast elsewhere with a clear message.

## Risks / Trade-offs

- [Risk] A scheduled task can keep launching the app if the user already has a manual prod process running. → Mitigation: document that only one production instance should be active and keep the task name stable for easy removal.
- [Risk] Login-triggered startup may race with slow logon environments. → Mitigation: use a simple wrapper that starts the existing prod pipeline after the shell is available instead of introducing service-style complexity.
- [Risk] Users may be unsure what "startup" means on Windows. → Mitigation: document that this is a current-user logon autostart, not a machine service.

## Migration Plan

1. Add a Windows startup helper that can install and remove the autostart registration.
2. Add root scripts for install and uninstall.
3. Add regression tests for command generation and unsupported-platform handling.
4. Update the README with the one-line install and uninstall workflow.
5. Optionally run the install command on the current machine after validation.
