# activity-authoring Specification

## Purpose
Define how parent/admin users create and manage recurring child activities, including single-action chores, step-based routines, scheduling, and instructional imagery.
## Requirements
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
The single activity creation flow SHALL support the core parent/admin inputs needed for household participation, including scheduling, while only showing fields that are useful for the current activity shape.

#### Scenario: Parent configures recurring activity details
- **WHEN** a parent/admin user completes the unified activity creation flow
- **THEN** the system allows the activity to include schedule information needed for execution
- **THEN** the system does not force the parent to interpret fields that are irrelevant to the current entity or current activity mode

#### Scenario: Parent finishes naming an activity
- **WHEN** a parent/admin user enters an activity name and leaves that field with a non-empty value
- **THEN** the system automatically requests an instructional preview image for that activity from the LLM-backed image generator
- **THEN** the system does not require the parent to paste a raw image URL or click a separate generate button to get the preview

#### Scenario: Parent does not manage rewards in the activity form
- **WHEN** a parent/admin user creates or edits an activity
- **THEN** the system does not show a separate reward type or reward amount control in the default form
- **THEN** the completion sticker experience remains automatic and separate from activity authoring

#### Scenario: Parent saves while instructional imagery is still pending
- **WHEN** a parent/admin user saves a valid activity before the generated instructional image or step thumbnails are ready
- **THEN** the system saves the activity immediately
- **THEN** the interface continues to show a generating-image state until the saved activity imagery is later available
- **THEN** save and error feedback remain visibly on screen even when the parent has scrolled down in the workspace

#### Scenario: Saved activity artwork appears later on the Sticker Chart
- **WHEN** a parent/admin user saves a valid activity before its generated instructional artwork has finished
- **THEN** the activity still appears immediately in the saved household data
- **THEN** background image generation continues after the save completes
- **THEN** once the generated artwork is persisted, the Sticker Chart shows the new activity image without requiring the parent to recreate the activity

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
The system SHALL let a parent admin list, create, update, and delete activities from the activities section of the Setup destination using a clean management workflow that preserves list context while editing.

#### Scenario: Parent views activities for the active child
- **WHEN** the parent opens the activity-management section for a selected child
- **THEN** the system clearly identifies the active child in the activity workspace
- **THEN** the visible activity list reflects that active child's activities
- **THEN** the system does not rely on an ambiguous generic list pattern that makes child ownership hard to infer

#### Scenario: Parent starts a new activity
- **WHEN** the parent is viewing the activity list for the active child
- **THEN** the system shows an obvious `Add new activity` action above the list
- **THEN** choosing that action opens a focused activity editor for one new record
- **THEN** after save or cancel, the system returns the parent to the child-scoped activity list

#### Scenario: Parent edits an existing routine
- **WHEN** the parent edits a step-based activity
- **THEN** the system loads the routine into the activity form and saves it through the routine update contract
- **THEN** the parent can still understand which activity list they came from without route-level disorientation
- **THEN** the interface focuses on that one activity record until the parent saves or cancels

#### Scenario: Parent edits an existing chore
- **WHEN** the parent edits a single-action activity
- **THEN** the system loads the chore into the activity form and saves it through the chore update contract
- **THEN** the system only shows single-action controls that are useful for that activity mode
- **THEN** the interface focuses on that one activity record until the parent saves or cancels

#### Scenario: Parent switches from one child to another while managing activities
- **WHEN** the parent changes the active child in setup
- **THEN** the system refreshes the visible activity list and the creation context for that child together
- **THEN** the system makes the child-to-activity mapping explicit without requiring the parent to infer it from a separate panel

#### Scenario: Parent deletes an activity
- **WHEN** the parent deletes a routine or chore
- **THEN** the system removes that activity from the saved state
- **THEN** the system also removes related completion, reward, and sticker-history records

#### Scenario: Parent starts creating a step-based activity
- **WHEN** the parent adds one or more subtasks to an activity
- **THEN** the system reveals the step-management controls needed for that activity
- **THEN** the system does not continue emphasizing single-action-only controls as if they were equally relevant
- **THEN** each subtask row only requires the parent to name the step and provides a clear remove action without exposing low-value icon or image URL fields in the default flow

#### Scenario: Parent reviews a step-based activity with picture thumbnails
- **WHEN** the parent is editing a routine with one or more subtasks
- **THEN** the system shows a visual thumbnail alongside each step so the sequence is easier to scan
- **THEN** the step thumbnail is generated automatically from the step content by the LLM-backed image generator instead of requiring manual image entry
- **THEN** generated step thumbnails are persisted with the routine so they remain available after reload

#### Scenario: Existing activities gain generated image assets
- **WHEN** the system loads an existing routine or chore that does not yet have generated artwork
- **THEN** the system generates the missing image assets
- **THEN** the generated artwork is written back to the saved activity record so it is available on future loads
- **THEN** the visible activity-management workspace remains usable while the generation work is still pending

#### Scenario: Parent starts creating a single-action activity
- **WHEN** the parent creates an activity without subtasks
- **THEN** the system keeps the form focused on the single-action path
- **THEN** the system does not force the parent to process step-management inputs that add no value for that case
