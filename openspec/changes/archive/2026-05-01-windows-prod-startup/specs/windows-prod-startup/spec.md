## ADDED Requirements

### Requirement: Windows prod autostart registration
The system SHALL provide a Windows-specific command that registers an autostart entry for the current user so the production server starts after Windows logon.

#### Scenario: User installs autostart
- **WHEN** a Windows user runs the documented autostart install command from the repository root
- **THEN** the system creates or updates a current-user logon registration
- **AND** the registration launches the existing production pipeline from the repository

### Requirement: Windows prod autostart removal
The system SHALL provide a Windows-specific command that removes the autostart registration for the production server.

#### Scenario: User removes autostart
- **WHEN** a Windows user runs the documented autostart uninstall command from the repository root
- **THEN** the current-user logon registration is removed
- **AND** the production server no longer starts automatically on logon

### Requirement: Autostart uses the existing production pipeline
The autostart registration SHALL launch the same local production pipeline used by the manual production command.

#### Scenario: Logon starts production
- **WHEN** the current Windows user logs in after autostart has been installed
- **THEN** the local production server starts using the repository's existing production pipeline
- **AND** the manual `npm run prod` command remains available for on-demand startup

### Requirement: Autostart commands are Windows-specific
The autostart install and uninstall commands SHALL fail with a clear unsupported-platform message when run on non-Windows platforms.

#### Scenario: Developer runs autostart command on macOS or Linux
- **WHEN** a non-Windows user runs the autostart install or uninstall command
- **THEN** the command exits without attempting to register startup behavior
- **AND** the command reports that the feature is Windows-only
