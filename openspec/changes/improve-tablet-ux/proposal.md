## Why

The product is intended to live on a shared household tablet, but several core surfaces still behave more like desktop layouts with mouse-sized controls. Parents and children need clearer handoff into tablet mode, larger touch-first interactions, and layouts that remain readable and reachable on common iPad-class screens.

## What Changes

- Add tablet-specific UX requirements for touch target sizing, safe-area spacing, orientation-aware layout, and reachable primary actions across shared-device surfaces.
- Improve the parent-to-child tablet handoff so a parent can launch and exit child-facing mode without losing context or exposing admin controls during child use.
- Refine parent/admin tablet layouts for Setup, Sticker Chart, and History so panels do not feel cramped, action controls remain reachable, and important context stays visible on medium-width touch screens.
- Update the child-facing tablet experience so the active task surface is easier to use in portrait and landscape orientations with larger, clearer completion affordances.

## Capabilities

### New Capabilities
- `tablet-device-ux`: Baseline tablet ergonomics for shared-device layouts, touch targets, safe-area spacing, and primary action placement.

### Modified Capabilities
- `workflow-navigation`: Add a clearer secondary launch and return path for child-facing tablet mode without making it a top-level parent destination.
- `shared-tablet-access`: Tighten the handoff and protection model for entering and exiting child-facing tablet use on a shared device.
- `parent-ux-workspace`: Make parent/admin workspaces adapt cleanly to tablet-sized screens with persistent context and reachable actions.
- `weekly-completion-matrix`: Keep the Sticker Chart readable and touch-friendly on tablet screens without sacrificing current-day completion behavior.
- `preschool-participation`: Improve the child-facing task surface for tablet orientation changes and large-touch interaction.

## Impact

- Affected client layout, navigation, and styling in `client/src/App.tsx`, workspace components, tablet components, and shared CSS.
- Likely affected view-model state for tablet mode launch, return context, and responsive surface composition.
- Affected client tests covering navigation, responsive tablet layouts, and child-facing task interaction behavior.
