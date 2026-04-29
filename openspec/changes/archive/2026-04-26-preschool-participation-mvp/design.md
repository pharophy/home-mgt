## Context

This repo currently contains a generic React client and Node server scaffold with no domain implementation. Product direction is now sharply focused on helping parents of a 4-year-old create repeatable household participation habits through shared-tablet routines and chores.

The key constraint is developmental fit. The child-facing experience cannot depend on reading, dense navigation, or independent task planning. The parent-facing experience must also stay lightweight enough that routine setup does not become another source of household admin work.

The MVP needs to define a clean domain model and UI architecture that can later expand toward broader family management without contaminating the first release with calendar-heavy complexity.

## Goals / Non-Goals

**Goals:**
- Model a single-household preschool participation system with parent, caregiver, and child roles.
- Support parent-authored routines and chores that render cleanly in a child-facing tablet mode.
- Support optional approval and lightweight rewards without building a complex gamification economy.
- Keep the implementation aligned with the existing React + Node stack and suitable for iterative delivery.

**Non-Goals:**
- Full family calendar and scheduling aggregation.
- Multi-household or co-parent sync.
- Native mobile apps in the first implementation.
- Rich AI automation, document intake, or meal-planning workflows.

## Decisions

### 1. Use one primary domain slice for preschool participation, with caregiver access as a separate permission capability

Decision:
- Model the main product around `household`, `childProfile`, `routine`, `routineStep`, `chore`, `completion`, and `rewardLedger`.
- Treat caregiver access as a role/authorization concern with distinct requirements and UI entry points.

Rationale:
- The child experience and parent authoring flows are tightly coupled and should evolve together.
- Caregiver access is real product scope, but it is better isolated as permissioned access than mixed into every participation requirement.

Alternative considered:
- Separate routines and chores into entirely different capabilities. Rejected for MVP because parents experience them as one habit-building system.

### 2. Optimize the client for a tablet PWA with distinct parent and child modes

Decision:
- Build the client as one React app with explicit modes:
  - Parent mode for setup, editing, and review
  - Child tablet mode for one-task-at-a-time execution

Rationale:
- One codebase minimizes overhead and keeps shared state and component reuse straightforward.
- The product’s core value depends on a stable shared-tablet mode, which a PWA can support quickly.

Alternative considered:
- Separate apps for parent and child. Rejected for MVP due to duplication and unnecessary complexity at this stage.

### 3. Represent routines as ordered templates that generate daily instances

Decision:
- Store parent-authored routines as reusable templates with ordered steps and recurrence metadata.
- Generate daily routine instances or resolve "today" views from the template plus completion records.

Rationale:
- Parents expect stable recurring routines like morning, cleanup, and bedtime.
- Template plus completion history makes streaks, daily progress, and editing easier than storing everything as standalone tasks.

Alternative considered:
- Store every routine execution as a separate manually created task list. Rejected because recurring behavior is central and would create more data churn.

### 4. Keep rewards lightweight and event-based

Decision:
- Start with simple stars or stickers awarded on routine/chore completion or parent approval.
- Store reward events separately from the routine/chore definition.

Rationale:
- Parents want reinforcement, but a full points marketplace would distort scope.
- Event-based reward records are enough for visible praise, totals, and later extension.

Alternative considered:
- No rewards in MVP. Rejected because immediate reinforcement is part of the core behavior loop for this age.

### 5. Use explicit role-based authorization from the start

Decision:
- Support at least `parentAdmin`, `caregiver`, and `childDisplay` interaction modes.
- The child display does not require free-form account management but must be protected from household-setting changes.

Rationale:
- Shared tablets in common spaces create real permission boundaries.
- Caregiver access is in scope and easier to implement cleanly if modeled early.

Alternative considered:
- Add permissions later after building core routines. Rejected because retrofitting auth into caregiver flows creates avoidable churn.

## Risks / Trade-offs

- [Risk] Parent setup becomes too heavy -> Mitigation: ship templates for common routines and keep custom authoring minimal.
- [Risk] Child mode becomes overstimulating -> Mitigation: use restrained animation and a configurable celebration setting.
- [Risk] Role modeling slows MVP implementation -> Mitigation: keep the role matrix small and scoped to the required flows.
- [Risk] Routines and chores blur together -> Mitigation: define routines as ordered step sequences and chores as standalone recurring contributions.
- [Risk] Future general family features could pressure the domain model early -> Mitigation: keep calendar and other household modules out of the first capability boundary.

## Migration Plan

1. Introduce the new domain documentation and specs.
2. Implement server-side entities and APIs for household roles, child profiles, routines, chores, completions, and rewards.
3. Implement parent authoring flows in the client.
4. Implement child tablet mode and caregiver flows.
5. Validate the end-to-end loop with a single-household MVP.

Rollback strategy:
- Since the repo is still at scaffold stage, rollback is low risk and can be handled by reverting the feature branch or change set before production use.

## Open Questions

1. Should routine steps support recorded parent voice in MVP or immediately after?
2. Should caregiver access be invitation-based from day one or configured locally first?
3. Should a single child profile be the only supported shape in the first implementation, even if the schema could support more?
4. Should approval happen per step, per routine, or only for chores?
