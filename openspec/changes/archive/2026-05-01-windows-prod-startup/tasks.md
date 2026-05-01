## 1. Windows autostart helper

- [x] 1.1 Add a Windows startup helper that creates and removes a current-user logon registration for the production pipeline.
- [x] 1.2 Add a hidden wrapper that launches the existing production command from the repository root.

## 2. Root scripts and docs

- [x] 2.1 Add root package scripts for installing and uninstalling the Windows autostart registration.
- [x] 2.2 Update the README with the new Windows autostart commands and clarify that startup means current-user logon.

## 3. Verification

- [x] 3.1 Add regression tests for the autostart command generation and unsupported-platform behavior.
- [x] 3.2 Validate the change with strict OpenSpec checks.
