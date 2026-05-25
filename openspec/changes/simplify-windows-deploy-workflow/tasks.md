## 1. Regression Coverage

- [x] 1.1 Update the deploy workflow regression test to assert the fixed region wiring and the absence of the resolver step
- [x] 1.2 Remove the standalone AWS region resolver test once the helper is no longer part of the live deploy path

## 2. Workflow Simplification

- [x] 2.1 Update `.github/workflows/deploy-starstep-windows.yml` to use the fixed AWS region directly in the credentials step
- [x] 2.2 Remove the unused AWS region resolver helper from `scripts/` and any live workflow references to it
- [x] 2.3 Remove the now-unused `AWS_REGION` repository variable and update the deployment docs to describe the fixed-input workflow

## 3. Validation

- [x] 3.1 Run the narrowed deploy workflow regression test suite locally
- [x] 3.2 Validate the OpenSpec change with `openspec validate simplify-windows-deploy-workflow --type change --strict --no-interactive`
