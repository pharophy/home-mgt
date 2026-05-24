## MODIFIED Requirements

### Requirement: Windows prod autostart registration
The system SHALL provide a Windows-specific command that registers a scheduled-task-based startup entry so the production server can be started through an unattended Windows startup path instead of a current-user Run-key registration.

#### Scenario: User installs autostart
- **WHEN** a Windows user runs the documented autostart install command from the repository root
- **THEN** the system creates or updates a Windows scheduled task for the production pipeline
- **AND** the scheduled task can be reused by deployment automation to start the production app without requiring manual file copying or an interactive desktop session

### Requirement: Windows prod autostart removal
The system SHALL provide a Windows-specific command that removes the scheduled-task-based startup registration for the production server.

#### Scenario: User removes autostart
- **WHEN** a Windows user runs the documented autostart uninstall command from the repository root
- **THEN** the Windows scheduled task for the production pipeline is removed
- **AND** the production server no longer starts automatically through that startup registration

### Requirement: Autostart uses the existing production pipeline
The autostart registration SHALL launch the deployed production runtime for the active release on the Windows host.

#### Scenario: Windows startup path launches production
- **WHEN** the configured Windows scheduled task starts the production pipeline
- **THEN** the active deployed release starts the production server without requiring a source rebuild
- **AND** the manual local production commands remain available for repository-based development workflows
