## MODIFIED Requirements

### Requirement: Managed generated images SHALL be served as static assets
The system SHALL serve managed generated images as same-origin static content so browsers can load them without invoking stateful image lookup logic.

#### Scenario: Browser loads a saved generated image
- **WHEN** the client renders a managed generated-image path for a routine, routine step, chore, or completion
- **THEN** the server responds by serving the corresponding file bytes from the managed asset directory
- **THEN** the request does not require rebuilding household state to locate the image

#### Scenario: Browser loads a saved generated image during local development
- **WHEN** the app is served from the Vite development server and the client renders a managed generated-image path
- **THEN** the development server proxies that same-origin generated-image request to the backend asset host
- **THEN** managed generated images load in development without requiring client code to swap to a different base URL

#### Scenario: Managed generated asset file is missing
- **WHEN** a browser requests a managed generated-image path whose file no longer exists
- **THEN** the request does not fall through to the client application shell
- **THEN** the server returns a missing-asset response instead of `index.html`
