# Codex Working Agreement

This repository uses `OpenSpec` and `TDD` by default for all meaningful work.

## Default Delivery Mode

For any feature, bug fix, refactor, behavior change, or non-trivial implementation task:

1. Work MUST begin with an OpenSpec change.
2. The change MUST follow the `spec-driven` workflow.
3. Code implementation MUST NOT begin until the relevant OpenSpec artifacts exist and are coherent.
4. Implementation MUST follow TDD: write or update a failing test first, make it pass with the smallest reasonable change, then refactor safely.

## Required OpenSpec Workflow

Before writing application code:

1. Create or update an OpenSpec change under `openspec/changes/<change-name>/`
2. Ensure the change includes:
   - `proposal.md`
   - `design.md` when the work crosses modules, changes data models, or benefits from technical decisions upfront
   - `specs/**/spec.md`
   - `tasks.md`
3. Validate the change before implementation when possible:
   - `openspec validate <change-name> --type change --strict --no-interactive`

If the request changes existing behavior, the behavior MUST be captured in specs before implementation.

## Required TDD Workflow

For implementation work:

1. Start with a failing automated test that captures the expected behavior.
2. Implement the minimum change needed to make the test pass.
3. Refactor only while keeping the test suite green.
4. Add or update higher-level integration tests when the behavior crosses UI, API, or persistence boundaries.

Bug fixes MUST include a regression test.

## When Work Is Too Small For A Full Design Doc

Even for smaller tasks, spec-driven still applies:

- Update or create the relevant OpenSpec change and spec artifact.
- Skip `design.md` only when the change is narrowly scoped and technically obvious.
- Still follow TDD for the implementation.

## Design Style Guidelines

When organizing or refactoring application code:

- group modules by responsibility rather than leaving unrelated concerns in one file
- keep domain models and constants separate from infrastructure concerns such as persistence, migration, auth, validation, and route wiring
- keep shared client contracts, constants, API helpers, and pure view-model logic separate from large React render components
- extract major UI sections when the top-level component would otherwise own multiple distinct panels or interaction modes
- prefer shallow, explicit directories like `domain`, `lib`, `routes`, `app`, and `components` over deep abstraction
- use pure logic extraction as the primary seam for additional unit tests
- avoid over-fragmentation; a file may contain multiple related items when they change for the same reason

## Definition Of Done

Work is not done until all of the following are true:

- OpenSpec artifacts reflect the shipped behavior
- tests cover the changed behavior
- tests pass locally
- any new constraints, assumptions, or follow-up work are documented in the change

## Priority Rule

If there is a conflict between moving fast and following spec-driven TDD, follow spec-driven TDD.
