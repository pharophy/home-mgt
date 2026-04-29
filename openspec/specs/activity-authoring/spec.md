## ADDED Requirements

### Requirement: Parent/admin users SHALL author routines and chores through a single activity creation flow
The system SHALL provide one parent/admin authoring flow for creating recurring child activities instead of separate routine and chore creation flows.

#### Scenario: Parent creates a new activity
- **WHEN** a parent/admin user starts creating a recurring child task
- **THEN** the system presents one unified creation flow rather than asking the user to choose between separate routine and chore forms first

### Requirement: Activity behavior SHALL derive from whether subtasks are present
The system SHALL determine whether an activity behaves as a step-based flow or a single-action item from whether the activity includes subtasks.

#### Scenario: Activity includes subtasks
- **WHEN** a parent/admin user adds one or more subtasks to an activity
- **THEN** the system stores and executes that activity as a step-based sequence

#### Scenario: Activity has no subtasks
- **WHEN** a parent/admin user creates an activity without subtasks
- **THEN** the system stores and executes that activity as a single-action item

### Requirement: Unified activity authoring SHALL support the existing recurring participation needs
The single activity creation flow SHALL support the core parent/admin inputs needed for household participation, including assignee selection, scheduling, optional approval, and optional rewards.

#### Scenario: Parent configures recurring activity details
- **WHEN** a parent/admin user completes the unified activity creation flow
- **THEN** the system allows the activity to include assignee information, schedule information, and any supported approval or reward settings needed for execution

### Requirement: Activities SHALL support an instructional task image
The system SHALL allow an activity to have a stable instructional image that communicates what the person is supposed to do.

#### Scenario: Parent configures an instructional image
- **WHEN** a parent/admin user creates or edits an activity
- **THEN** the system allows the activity to include an instructional task image used during completion and execution

### Requirement: The system SHALL support AI-generated instructional task images
The system SHALL be able to generate an instructional task image from the activity description and, when present, the subtask details.

#### Scenario: Activity image is generated from activity details
- **WHEN** a parent/admin user creates or updates an activity and chooses to generate the instructional image
- **THEN** the system creates an instructional image using the activity description and any subtask details as prompt context

### Requirement: Unified authoring SHALL reduce upfront taxonomy decisions for the parent
The system SHALL avoid forcing the parent/admin user to classify the task as a routine or a chore before entering the activity details.

#### Scenario: Parent begins authoring
- **WHEN** a parent/admin user starts the creation flow
- **THEN** the system begins with activity details rather than a required routine-versus-chore decision

### Requirement: Parent admins SHALL manage activities from a dedicated page
The system SHALL let a parent admin list, create, update, and delete activities from the activities page.

#### Scenario: Parent edits an existing routine
- **WHEN** the parent edits a step-based activity
- **THEN** the system loads the routine into the activity form and saves it through the routine update contract

#### Scenario: Parent edits an existing chore
- **WHEN** the parent edits a single-action activity
- **THEN** the system loads the chore into the activity form and saves it through the chore update contract

#### Scenario: Parent deletes an activity
- **WHEN** the parent deletes a routine or chore
- **THEN** the system removes that activity from the saved state
- **THEN** the system also removes related completion, reward, and sticker-history records

#### Scenario: Parent attempts to save an invalid activity
- **WHEN** the parent tries to save an activity without a name or without selecting at least one scheduled day
- **THEN** the system does not send the activity request
- **THEN** the system shows a clear validation message explaining what is required

#### Scenario: Activity save is rejected by the server
- **WHEN** the server rejects an activity save request with a validation error
- **THEN** the system shows the returned validation message instead of a generic request failure string
