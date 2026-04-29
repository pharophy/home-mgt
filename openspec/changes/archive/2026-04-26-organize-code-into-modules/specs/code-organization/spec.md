## ADDED Requirements

### Requirement: Mixed-responsibility application files MUST be split into cohesive modules

The repository MUST organize application code so that unrelated concerns do not remain bundled in a single top-level file.

#### Scenario: Server modules separate domain, infrastructure, and route concerns

- **GIVEN** the server contains domain models, persistence logic, request authorization, validation, reward handling, and HTTP endpoints
- **WHEN** the server implementation is organized
- **THEN** domain types and constants MUST live outside route-registration files
- **AND** persistence and migration logic MUST live outside route-registration files
- **AND** route-registration modules MUST focus on request handling and composition

#### Scenario: Client modules separate app model, utilities, and UI composition

- **GIVEN** the client contains API contracts, initial state, pure helper logic, event handlers, and multiple rendered sections
- **WHEN** the client implementation is organized
- **THEN** shared types and constants MUST live outside large render components
- **AND** pure helper logic MUST live outside large render components
- **AND** major UI sections SHOULD be extracted when a top-level component would otherwise mix multiple distinct panels or modes

### Requirement: Repository guidance MUST define the modular organization style

The repository guidance documents MUST describe the preferred file-organization style so future work follows the same boundaries.

#### Scenario: Engineering guidance documents the organization rules

- **GIVEN** a contributor is adding or refactoring application code
- **WHEN** they read repository guidance
- **THEN** the guidance MUST instruct them to group files by responsibility
- **AND** the guidance MUST discourage mixing types, infrastructure, route wiring, and large UI sections in one file
- **AND** the guidance MUST favor extracting pure logic into independently testable modules
