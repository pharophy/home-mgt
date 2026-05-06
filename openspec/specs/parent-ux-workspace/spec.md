# parent-ux-workspace Specification

## Purpose
TBD - created by archiving change streamline-parent-ux-navigation. Update Purpose after archive.
## Requirements
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

### Requirement: Parent/admin workspaces SHALL adapt cleanly to tablet-sized screens
The system SHALL keep parent/admin planning, setup, and review surfaces readable and operable on common tablet widths without requiring desktop-scale precision.

#### Scenario: Parent opens a workspace on a portrait tablet
- **WHEN** a parent/admin user opens Setup, Sticker Chart, or History on a portrait-oriented tablet
- **THEN** the system stacks or condenses panels so content remains readable without awkward side-by-side crowding
- **THEN** the active child context and primary workflow controls remain visible without requiring the parent to infer hidden state

#### Scenario: Parent uses a long management surface on a tablet
- **WHEN** a parent/admin user scrolls a tablet-sized parent workspace with forms, lists, or history content
- **THEN** the workspace keeps its primary action and feedback affordances reachable
- **THEN** the surface does not require repeated full-page scrolling to save, switch context, or understand the current mode

#### Scenario: Parent uses the same workspace on desktop and tablet
- **WHEN** a parent/admin user opens the same workspace on desktop and tablet-sized screens
- **THEN** the system preserves the same sections, actions, and workflow order
- **THEN** the tablet adaptation changes layout density and ergonomics rather than introducing a different parent workflow

