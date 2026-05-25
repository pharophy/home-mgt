## Why

The product has shifted to the Starstep name, but the app shell and browser-level identity are not fully captured as a coherent product-branding change. The current work adds a branded header, favicon, and manifest metadata, so the OpenSpec change should describe that identity update explicitly before implementation continues.

## What Changes

- Add a Starstep-branded header to the main app shell so the parent-facing workspace carries a clear product identity.
- Set the browser title, favicon, theme color, and manifest metadata to Starstep so installed or bookmarked surfaces use the same branding.
- Add regression coverage for the shell branding and browser metadata.

## Capabilities

### New Capabilities
- `app-branding`: The app shell presents Starstep branding consistently in the visible header and browser metadata.

### Modified Capabilities
- `parent-ux-workspace`: The parent-facing shell gains branded product chrome without reintroducing dashboard-style distractions.

## Impact

- Affected client shell: `client/src/App.tsx`
- Affected browser entry metadata: `client/index.html`
- Affected client tests: `client/src/App.test.tsx`
- Affected styling/assets: header layout styles and Starstep logo/icon assets
