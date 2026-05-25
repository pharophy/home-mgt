## Why

The Windows EC2 deploy step is currently emitting multiple PowerShell command strings to AWS SSM, and the resulting payload can be flattened without statement separators. That makes the remote script fail before it can start the actual deployment work.

## What Changes

- Make the Windows SSM command payload parse-safe by emitting explicit statement terminators.
- Keep the remote deployment logic and target host unchanged.
- Add regression coverage for the SSM payload shape so the command body stays safe when refactored.

## Capabilities

### New Capabilities
- `windows-ssm-command-payload`: a parse-safe SSM command payload for the Windows deploy step.

### Modified Capabilities
- `windows-deploy-workflow`: no requirement change.

## Impact

`.github/workflows/deploy-starstep-windows.yml`, the deploy workflow regression test, and the Windows deploy documentation if command-shape details are mentioned.
