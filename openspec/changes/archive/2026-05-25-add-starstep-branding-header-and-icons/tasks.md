## 1. Spec And Design

- [x] 1.1 Define the Starstep shell-branding scope in proposal, design, and app-branding spec artifacts

## 2. Regression Coverage

- [x] 2.1 Add a client regression test that fails when the Starstep shell branding does not render
- [x] 2.2 Add a client regression test that fails when favicon or manifest metadata no longer points to Starstep assets

## 3. Client Branding Implementation

- [x] 3.1 Update the app shell to render the Starstep brand header ahead of the top-level navigation
- [x] 3.2 Update browser metadata so title, favicon, manifest, and theme color use the Starstep identity
- [x] 3.3 Add or update the Starstep logo/icon assets needed by the shell and browser metadata

## 4. Validation

- [x] 4.1 Run the relevant client test coverage for Starstep shell branding and metadata
- [x] 4.2 Validate the change with `openspec validate add-starstep-branding-header-and-icons --type change --strict --no-interactive`
