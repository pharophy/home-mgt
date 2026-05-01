## MODIFIED Requirements

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

#### Scenario: Parent starts creating a single-action activity
- **WHEN** the parent creates an activity without subtasks
- **THEN** the system keeps the form focused on the single-action path
- **THEN** the system does not force the parent to process step-management inputs that add no value for that case
