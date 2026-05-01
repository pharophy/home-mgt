# caregiver-access Specification

## Purpose
Define the deferred caregiver access model, including constrained caregiver permissions for running child activities without full household administration.

## Requirements

### Requirement: Parents can grant caregiver access
The system SHALL allow a parent to grant a caregiver access to the household participation system with permissions narrower than full administration.

#### Scenario: Parent adds a caregiver
- **WHEN** a parent creates or invites a caregiver account
- **THEN** the system grants caregiver access limited to the configured permissions

### Requirement: Caregivers can run existing routines and chores
The system SHALL allow a caregiver to view the child's current routines and chores and record progress without editing protected household settings.

#### Scenario: Caregiver runs the child's current routine
- **WHEN** a caregiver opens the child's active plan
- **THEN** the system allows the caregiver to start, view, and mark routine progress

#### Scenario: Caregiver marks chore completion
- **WHEN** a caregiver records a chore as completed
- **THEN** the system stores the completion under caregiver context for later parent review

### Requirement: Caregiver permissions protect household administration
The system SHALL prevent caregivers from editing household settings or parent-only controls unless explicitly permitted.

#### Scenario: Caregiver attempts to edit restricted settings
- **WHEN** a caregiver accesses a parent-only setting or management action without permission
- **THEN** the system denies the action and does not apply the change
