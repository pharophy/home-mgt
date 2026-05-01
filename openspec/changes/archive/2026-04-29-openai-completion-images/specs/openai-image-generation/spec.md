## ADDED Requirements

### Requirement: The system SHALL generate completion images through a server-side OpenAI integration
The system SHALL call the OpenAI API from the server, using environment-based credentials, when asked to generate celebratory completion imagery.

#### Scenario: Server receives a completion-image request
- **WHEN** a client requests celebratory imagery for a completed activity
- **THEN** the server uses its configured OpenAI credentials to request a generated image instead of delegating image generation to the browser

### Requirement: The system SHALL read OpenAI credentials from server environment configuration
The system SHALL read the OpenAI API key from server environment configuration and SHALL NOT expose that key in client code or browser requests.

#### Scenario: Server boots with OpenAI configuration
- **WHEN** the app starts with an OpenAI API key present in `.env`-backed environment variables
- **THEN** the server can create OpenAI image requests without requiring the browser to send a secret

### Requirement: The system SHALL return completion images in a client-renderable format
The system SHALL return generated completion imagery in a format the client can render immediately in the existing celebration UI.

#### Scenario: Image generation succeeds
- **WHEN** the OpenAI image request completes successfully
- **THEN** the server responds with an image payload that the client can assign directly to an image element for celebratory display

### Requirement: The system SHALL fail completion-image generation without exposing server secrets
The system SHALL treat OpenAI configuration and request failures as recoverable endpoint failures and SHALL NOT return server secrets or internal credential values in error responses.

#### Scenario: OpenAI configuration is missing or generation fails
- **WHEN** the server cannot create a completion image because configuration is missing or the OpenAI request fails
- **THEN** the server returns a recoverable error response that allows the client to keep the completion recorded while showing the image as unavailable
