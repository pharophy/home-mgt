## Why

The Windows deploy workflow already runs against a fixed AWS region and a fixed set of GitHub secrets, so the extra resolver steps and validation scripts are only adding failure surface. Simplifying the workflow reduces maintenance cost and makes deploy failures easier to diagnose.

## What Changes

- Remove runtime AWS region resolution from the deploy workflow.
- Configure `aws-actions/configure-aws-credentials` with the known static region directly.
- Keep the deploy artifact and SSM steps intact.
- Remove workflow tests that only asserted the removed resolver wiring.
- Update the deployment docs to reflect the smaller fixed-input workflow.

## Capabilities

### New Capabilities
- `windows-deploy-workflow`: a stable Windows deployment workflow that uses a fixed AWS region and repository secrets without runtime lookup logic.

### Modified Capabilities
- `local-production-pipeline`: no requirement change.

## Impact

GitHub Actions workflow YAML, deployment workflow regression tests, deployment documentation, and the OpenSpec deployment spec set.
