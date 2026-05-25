## ADDED Requirements

### Requirement: Windows SSM deploy payload is parse-safe
The system SHALL send the Windows SSM deploy commands as standalone PowerShell statements that remain syntactically valid if SSM flattens them with whitespace.

#### Scenario: SSM builds the remote script
- **WHEN** the deploy workflow sends the inline PowerShell payload to `AWS-RunPowerShellScript`
- **THEN** each command string ends as a complete PowerShell statement
- **AND** adjacent commands remain parseable if SSM joins them with spaces

### Requirement: Windows SSM deploy payload preserves the deploy script invocation
The system SHALL continue to invoke the downloaded deploy script with the artifact URL, release ID, and app root after the script content is staged on the target host.

#### Scenario: Deploy command runs remotely
- **WHEN** the SSM command executes on the Windows instance
- **THEN** it writes the staged script content to a temporary `.ps1` file
- **AND** it invokes that script with the artifact URL, release ID, and app root arguments
