# Repository Instructions

This repository uses `OpenSpec` and `TDD` by default for all meaningful work.

## Required Delivery Workflow

For any feature, bug fix, refactor, behavior change, or other non-trivial implementation task:

1. Start by creating or updating an OpenSpec change.
2. Use the `spec-driven` workflow.
3. Do not implement application code until the relevant OpenSpec artifacts exist and are coherent.
4. Use TDD for implementation: write a failing test first, make it pass with the smallest reasonable change, then refactor with the tests green.

## Required OpenSpec Artifacts

Before implementation, the active change should include the applicable artifacts under `openspec/changes/<change-name>/`:

- `proposal.md`
- `design.md` when the change crosses modules, changes data models, or benefits from technical decisions up front
- `specs/**/spec.md`
- `tasks.md`

Validate the change before implementation when practical:

- `openspec validate <change-name> --type change --strict --no-interactive`

If behavior changes, the spec must be updated before the code.

## Required TDD Rules

1. Begin with a failing automated test that captures the behavior being added or fixed.
2. Implement the minimum code needed to pass the test.
3. Refactor only while the relevant tests remain green.
4. Add or update integration tests when behavior crosses UI, API, or persistence boundaries.

Bug fixes must include a regression test.

## Small Changes

Even small changes should follow the same direction:

- create or update the relevant OpenSpec change
- skip `design.md` only when the change is narrowly scoped and technically obvious
- still follow TDD for implementation

## Design Style Guidelines

When organizing application code:

- group files by responsibility, not by arbitrary size thresholds
- keep domain types/constants separate from infrastructure and route wiring
- keep persistence, migration, auth, validation, and other infrastructure helpers out of endpoint registration files
- keep shared client types, constants, API helpers, and pure view-model logic out of large render components
- extract major UI sections when a top-level component would otherwise mix multiple distinct modes or panels
- prefer shallow, explicit folders such as `domain`, `lib`, `routes`, `app`, and `components`
- favor pure helper modules as the first extraction seam so logic can be tested independently
- avoid one-symbol-per-file fragmentation; each file should stay cohesive around one reason to change

## Definition Of Done

Work is not complete until:

- OpenSpec artifacts match the delivered behavior
- tests cover the changed behavior
- tests pass locally
- any important follow-up constraints or assumptions are documented

## Priority Rule

If there is any tension between speed and spec-driven TDD, follow spec-driven TDD.
