## ADDED Requirements

### Requirement: Windows deploy workflow uses a fixed AWS region
The system SHALL configure the Windows deployment workflow with a fixed AWS region for AWS credential setup.

#### Scenario: Deployment workflow configures AWS credentials
- **WHEN** the Windows deployment workflow runs
- **THEN** the AWS credential step uses `us-west-2`
- **AND** the workflow does not require runtime AWS region resolution

### Requirement: Windows deploy workflow uses repository secrets
The system SHALL read the AWS deployment credentials and target identifiers from GitHub repository secrets.

#### Scenario: Deployment workflow prepares the deploy inputs
- **WHEN** the workflow runs
- **THEN** it reads the AWS access key, AWS secret key, deployment bucket, and EC2 instance ID from repository secrets
- **AND** it can upload the deployment artifact and invoke the Windows SSM deploy command without additional runtime lookup

### Requirement: Windows deploy workflow keeps the deploy path intact
The system SHALL continue to build the application, stage a release artifact, upload it to S3, and trigger the Windows EC2 deployment command.

#### Scenario: Deployment workflow completes the release path
- **WHEN** the workflow runs with valid secrets
- **THEN** it builds the workspaces
- **AND** stages the release artifact
- **AND** uploads the artifact to S3
- **AND** invokes the remote Windows deployment command
