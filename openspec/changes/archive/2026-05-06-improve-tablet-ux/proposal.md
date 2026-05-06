## Why

The app should remain the same product on desktop and tablet, but several core surfaces still behave more like desktop layouts with mouse-sized controls and cramped panel arrangements. The immediate need is to improve responsive ergonomics on tablet-class screens without introducing navigation changes or separate device-specific workflows.

## What Changes

- Add tablet-specific UX requirements for touch target sizing, safe-area spacing, and reachable primary actions while preserving the same workflows and information architecture used on desktop.
- Refine responsive layouts for Setup, Sticker Chart, History, and other existing app surfaces so panels do not feel cramped and important context stays visible on medium-width touch screens.
- Improve the top-of-funnel Sticker Chart interaction so tapping a reward target immediately shows loading feedback while celebratory sticker generation is still in flight.
- Improve backend sticker-generation speed so the final celebratory image returns faster without a noticeable drop in visible quality.
- Improve post-generation Sticker Chart UX so earned stickers open into a maximized view on tap while deletion remains a separate, explicit action.
- Keep parent/admin and child-facing behavior unchanged at the workflow level, while making the existing surfaces easier to use with touch and tablet-sized viewports.

## Capabilities

### New Capabilities
- `tablet-device-ux`: Baseline tablet ergonomics for shared-device layouts, touch targets, safe-area spacing, and primary action placement.

### Modified Capabilities
- `parent-ux-workspace`: Make parent/admin workspaces adapt cleanly to tablet-sized screens with persistent context and reachable actions.
- `weekly-completion-matrix`: Keep the Sticker Chart readable and touch-friendly on tablet screens without sacrificing current-day completion behavior.

## Impact

- Affected client layout and styling in workspace components and shared CSS.
- Affected Sticker Chart interaction timing and visible pending/loading states around completion clicks.
- Affected Sticker Chart completed-state controls, including explicit delete affordances and maximized sticker viewing.
- Affected server-side completion image generation configuration for sticker images.
- May affect component composition for responsive parent/admin and existing child-facing surfaces, but not route structure or workflow logic.
- Affected client tests covering responsive tablet layouts, touch-friendly controls, immediate completion feedback, explicit sticker deletion, and maximized sticker viewing.
- Affected server tests covering completion image generation configuration.
