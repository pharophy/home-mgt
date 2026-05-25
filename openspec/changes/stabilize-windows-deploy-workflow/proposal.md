## Why

The Windows deployment workflow has failed in two different ways during recent production deploy attempts. One run tried to package a `generated-assets` directory that did not exist in CI, and the newer run still fails because `aws-actions/configure-aws-credentials` receives an empty `aws-region` input when the repository secret is unset. The current workflow is too brittle for routine production deploys.

## What Changes

- Harden the AWS configuration path so the workflow can resolve the deployment region from repository configuration or from the deployment bucket when the explicit region secret is absent.
- Add regression coverage for the AWS region resolver and for the workflow wiring that consumes it before credential configuration.
- Update the deployment documentation so the AWS region input is documented as optional when the deployment bucket can be used as the fallback source of truth.

## Capabilities

### Modified Capabilities
- `aws-ec2-deployment`: The deployment workflow resolves the AWS region robustly enough to continue packaging and remote deployment when the explicit region secret is omitted.

## Impact

- Affected workflow: `.github/workflows/deploy-starstep-windows.yml`
- Affected deployment helper scripts: new AWS region resolver for CI
- Affected docs: Windows EC2 deployment instructions
- Affected tests: add deploy workflow regression coverage
