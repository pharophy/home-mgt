## ADDED Requirements

### Requirement: The parent workspace SHALL prioritize action over decorative chrome
The system SHALL present the parent/admin workspace as a task-focused product surface and SHALL NOT devote primary above-the-fold space to decorative or promotional chrome that does not improve planning, setup, or review.

#### Scenario: Parent opens the app
- **WHEN** a parent/admin user opens the main workspace
- **THEN** the system emphasizes the current working surface and key actions instead of a large decorative hero section

### Requirement: The parent workspace SHALL consolidate setup tasks into one management destination
The system SHALL provide one `Setup` destination that contains the child-management and activity-management workflows as secondary sections of the same parent/admin workspace.

#### Scenario: Parent enters setup
- **WHEN** a parent/admin user opens the setup destination
- **THEN** the system presents clearly labeled `Children` and `Activities` management sections without requiring separate top-level destinations for each

### Requirement: Setup management patterns SHALL remain uniform across entity types
The system SHALL use the same core CRUD interaction model for child management and activity management so parents do not have to relearn how to add, edit, or delete records in each section.

#### Scenario: Parent moves from child management to activity management
- **WHEN** a parent/admin user switches between `Children` and `Activities` inside Setup
- **THEN** both sections use a default list view, a top-level `Add new` action, row-level edit/delete actions, and the same save/cancel return pattern

### Requirement: Parent management surfaces SHALL preserve list context while editing
The system SHALL allow parents to scan entities, choose one, and edit it without losing the surrounding management context.

#### Scenario: Parent edits a managed entity
- **WHEN** a parent/admin user chooses a child or activity to edit
- **THEN** the system keeps the relevant management list visible or immediately recoverable while the edit surface is active

### Requirement: The Sticker Chart surface SHALL avoid a separate dashboard panel
The system SHALL keep the Sticker Chart surface centered on the weekly matrix and selected-child context rather than presenting a separate parent dashboard panel.

#### Scenario: Parent views the chart surface
- **WHEN** a parent/admin user opens Sticker Chart
- **THEN** the system does not present a separate dashboard panel below or beside the matrix
