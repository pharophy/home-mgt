## Context

The Windows GitHub Actions deploy workflow has been hardened already, but the current implementation still carries extra region-resolution logic and regression coverage for a value that never changes in practice. The deployment target is fixed to `us-west-2`, and the workflow already depends on a stable set of repository secrets.

## Goals / Non-Goals

**Goals:**
- Remove the dynamic AWS region lookup path from the live deploy workflow.
- Keep the deploy artifact upload and SSM deployment path intact.
- Reduce the number of workflow-specific helper scripts and tests that are not needed for the fixed deployment shape.

**Non-Goals:**
- Do not change the deployment target, artifact shape, or remote Windows deployment script.
- Do not migrate the workflow to OIDC or another credential mechanism in this change.
- Do not alter the local production pipeline or the Windows startup behavior.

## Decisions

- Use a fixed `aws-region: us-west-2` in the credentials step.
  - Rationale: the deployment region is stable, so resolving it dynamically just adds failure surface.
  - Alternative considered: keep the resolver but simplify its inputs. Rejected because it still leaves a runtime branch that can fail before deploy work starts.
- Keep AWS credentials and deploy target as repository secrets.
  - Rationale: the workflow already relies on those values and they are the minimum required inputs.
  - Alternative considered: hardcode more values into the workflow. Rejected because secrets should remain in GitHub, not in YAML.
- Remove the region resolver helper and its dedicated test once the workflow no longer references it.
  - Rationale: dead helper logic and tests increase maintenance and obscure the actual deploy path.
  - Alternative considered: leave the helper file in place unused. Rejected because it keeps stale logic around with no runtime value.

## Risks / Trade-offs

- [Risk] Changing the region requires editing the workflow file directly -> Mitigation: the region is already known and stable, so a single explicit line is easier to audit than runtime inference.
- [Risk] Removing the helper makes the workflow less flexible if the region ever changes -> Mitigation: if the deployment target moves, add a new explicit workflow change instead of reintroducing runtime discovery.
- [Risk] Existing docs may mention optional region resolution -> Mitigation: update the deployment docs in the same change so the documented contract matches the YAML.

## Migration Plan

1. Update the workflow to use a fixed AWS region.
2. Remove the unused resolver helper and its workflow regression test.
3. Update the deployment documentation to describe the fixed-input workflow.
4. Run the narrowed workflow regression test and the existing deployment validation checks.

Rollback is straightforward: restore the previous workflow, helper, and docs if the simplification causes an unexpected deploy regression.

## Open Questions

None.
