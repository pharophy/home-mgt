## 1. Regression Coverage

- [x] 1.1 Update the deploy workflow regression test to assert semicolon-terminated SSM command strings

## 2. Workflow Fix

- [x] 2.1 Add explicit statement terminators to each inline SSM command string in the deploy workflow
- [x] 2.2 Keep the remote script invocation unchanged while ensuring the payload remains parse-safe if flattened

## 3. Validation

- [x] 3.1 Run the deploy workflow regression test locally
- [x] 3.2 Validate the OpenSpec change with `openspec validate fix-windows-ssm-command-payload --type change --strict --no-interactive`
