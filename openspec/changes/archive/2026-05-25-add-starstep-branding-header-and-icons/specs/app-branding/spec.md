## ADDED Requirements

### Requirement: The app shell SHALL present Starstep branding clearly

The system SHALL show Starstep product branding in the main parent-facing application shell so the user sees a consistent product identity before entering Sticker Chart, Setup, or History workflows.

#### Scenario: Parent-facing shell loads
- **WHEN** the main application shell renders
- **THEN** the shell shows a Starstep-branded header before the top-level workflow navigation
- **AND** the header includes a Starstep logo or mark
- **AND** the header copy reinforces the shared family-routine positioning without adding extra workflow controls

### Requirement: Browser metadata SHALL match the Starstep product identity

The system SHALL expose Starstep browser metadata so bookmarked, installed, and tab-level surfaces use the same branding as the visible app shell.

#### Scenario: Browser tab metadata is initialized
- **WHEN** the client application starts
- **THEN** the document title is set to `Starstep`
- **AND** the active favicon points to an icon-only Starstep logo asset from the same brand family as the visible app shell
- **AND** the page exposes theme-color metadata that matches the branded shell palette

#### Scenario: Install metadata is exposed
- **WHEN** the client application starts
- **THEN** the document head exposes manifest metadata for the Starstep app identity
- **AND** the manifest includes `name` and `short_name` values of `Starstep`
- **AND** the manifest icons reference an icon-only Starstep logo asset from the same brand family as the visible app shell
