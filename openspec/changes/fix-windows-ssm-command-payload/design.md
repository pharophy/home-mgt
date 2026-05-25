## Context

The deploy workflow already stages the artifact and reaches the SSM step. The failure is in how the inline PowerShell commands are serialized before being sent to `AWS-RunPowerShellScript`.

## Goals / Non-Goals

**Goals:**
- Preserve the existing deploy flow and remote script contents.
- Prevent SSM payload flattening from turning adjacent statements into a syntax error.

**Non-Goals:**
- Do not change the deployment target, AWS region, or artifact format.
- Do not rewrite the remote deploy script into a different transport mechanism.

## Decisions

- Add explicit semicolons to each command string sent to SSM.
  - Rationale: the payload is already being emitted as discrete strings, so explicit terminators make the remote script resilient even if the transport joins them with spaces.
  - Alternative considered: build one long multiline here-string inside the workflow. Rejected because the existing command-array approach is easier to keep small and review.
- Keep the remote script file unchanged.
  - Rationale: the bug is in the workflow serialization layer, not in the deployment logic itself.
  - Alternative considered: move all orchestration into the remote script. Rejected because it would duplicate logic and make the workflow less transparent.

## Risks / Trade-offs

- [Risk] Semicolon termination may hide other formatting issues -> Mitigation: add a regression test that checks the emitted command strings explicitly.
- [Risk] The command array still depends on SSM serialization behavior -> Mitigation: the command strings become valid standalone statements, so concatenation no longer breaks parsing.

## Migration Plan

1. Update the workflow command strings.
2. Tighten the workflow regression test.
3. Validate locally and with a live GitHub Actions run.

Rollback is restoring the prior workflow command strings if the new payload causes an unexpected deployment regression.

## Open Questions

None.
