## 1. Regression Coverage

- [x] 1.1 Add a failing automated test for AWS region resolution when the explicit region is missing
- [x] 1.2 Add a failing automated test for the workflow wiring that consumes the resolved region output

## 2. Workflow Hardening

- [x] 2.1 Add the minimal AWS region resolver needed to satisfy the new test coverage
- [x] 2.2 Update the Windows deployment workflow to resolve the region before configuring AWS credentials
- [x] 2.3 Update the deployment documentation to match the hardened workflow inputs

## 3. Validation

- [x] 3.1 Run the new deploy workflow regression tests
- [x] 3.2 Validate the OpenSpec change with `openspec validate stabilize-windows-deploy-workflow --type change --strict --no-interactive`
