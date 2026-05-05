## ADDED Requirements

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
