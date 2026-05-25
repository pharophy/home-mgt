## MODIFIED Requirements

### Requirement: GitHub Actions SHALL deploy the production app to AWS from the main branch
The system SHALL provide a GitHub Actions workflow that validates the production app, publishes a release artifact, applies required production database migrations, and deploys that artifact to the existing Windows EC2 instance without requiring manual file copying from a developer workstation or Git operations on the production host.

#### Scenario: AWS region secret is omitted but the deployment bucket is configured
- **WHEN** the deployment workflow starts without an explicit `AWS_REGION` repository secret
- **AND** the workflow still has AWS credentials plus the configured deployment bucket
- **THEN** the workflow resolves the AWS region from the deployment bucket metadata before configuring AWS credentials
- **AND** the workflow continues with artifact upload and Systems Manager deployment in that resolved region

#### Scenario: AWS region cannot be resolved from configuration
- **WHEN** the deployment workflow starts without an explicit `AWS_REGION` repository secret
- **AND** the workflow cannot resolve the deployment region from the deployment bucket metadata
- **THEN** the workflow fails before artifact upload or remote deployment
- **AND** the failure message identifies the missing AWS region configuration clearly enough for the operator to correct it
