# Project Layout Rules

This is a large multi-page HTML/CSS/JS project based on Figma layouts. Keep the codebase organized, scalable, and suitable for a big Figma-to-code build.

## Source Of Truth

- Use Figma MCP nodes as the source for exact sizes, spacing, colors, typography, and assets.
- For pixel-perfect tasks, inspect all provided Figma variants before editing: desktop, tablet, and mobile.
- Match block dimensions, spacing, typography, element positioning, Bootstrap/container behavior, cards, buttons/forms, icons, colors, borders, shadows, and hover/focus states.
- Do not improve, simplify, redesign, add UI elements, or substitute a "similar" layout when the user asks for 1:1 Figma matching.
- The success criterion for these tasks is visual indistinguishability from Figma in all supplied responsive versions.
- Put reusable design values in `assets/styles/base/variables.css`.
- Do not introduce hardcoded colors, shadows, radii, font weights, or repeated spacing values in section files when a token already exists.
- Add missing project-wide tokens before using the same value in multiple sections.

## Figma Pixel-Perfect Requirements

- Copy absolutely everything from the provided Figma nodes: icons, SVG paths, images, colors, gradients, opacity, shadows, borders, radii, dimensions, x/y positioning, gaps, padding, margins, typography, line-height, letter-spacing, font weight, and responsive behavior.
- Do not invent, redraw, approximate, or substitute icons, images, SVG paths, or UI elements. If Figma provides a specific icon/asset/path, use that exact asset/path.
- Do not reuse an existing "similar" icon or component unless it is confirmed to be the same Figma asset/component for that exact node and state.
- When an icon or image is inside a Figma node, inspect that child node or downloaded asset before implementing it. If the asset cannot be fetched or identified, stop and state the blocker instead of guessing.
- Keep separate icons separate: header icons, card icons, navigation icons, status icons, and section icons must not be collapsed into one shared icon unless Figma uses the same source asset.
- Match Figma component states and page variants independently. A demo header, logged-in cabinet header, public-site header, tablet header, and mobile header are different variants unless Figma proves they are identical.
- Preserve Figma text content, capitalization, punctuation, whitespace intent, and line breaks. Do not rewrite labels or helper copy.
- Preserve Figma layout hierarchy and internal spacing. Outer dimensions, internal padding, child gaps, alignment, and flex/grid behavior must match the inspected node, not an inferred layout.
- Use existing project components only when they can be adapted to the exact Figma output. If an existing component differs in icon, spacing, typography, color, or state, override or extend it for the exact variant instead of accepting the mismatch.
- Verification must compare the implemented page against the supplied Figma node for every provided breakpoint and variant.

## CSS Structure

- `assets/styles/base/variables.css`: colors, typography, spacing, radii, shadows, layout tokens.
- `assets/styles/components/`: reusable components such as buttons, section titles, tabs, cards, controls.
- `assets/styles/sections/`: page sections and section-specific composition only.
- `assets/styles/responsive.css`: breakpoint overrides only.

## Component Rules

- Repeated blocks must become reusable BEM components or shared component styles.
- Section files may position and compose components, but should not redefine the same button, card, typography, or icon patterns.
- Keep class names BEM-like and scoped: `.block`, `.block__element`, `.block--modifier`.
- Prefer asset files for Figma-exported icons/logos instead of inline SVG when the asset repeats.
- Every clickable button/control must have a simple hover/focus interaction: use an existing tokenized transition, a subtle transform/filter/background/border change, and avoid raw browser default outlines unless they match the design.
- Similar or identical clickable elements across pages must reuse the same hover, focus, active-state, and animation behavior. Before adding or changing a hover effect, check existing matching controls and keep transitions, transforms, colors, shadows, and icon state behavior consistent unless Figma explicitly shows a different state.

## Interaction Logic Rules

- When implementing Figma forms and modals, implement the obvious behavior implied by the UI controls, not only the static layout: selects open, options can be selected, selected/active states update, links are clickable, and buttons with modal-flow meaning advance to the provided next state.
- When a control clearly starts a page flow or navigates to another state/page, wire that flow immediately instead of leaving the control inert. For example, `Создать рассылку` on the `Рассылки` page must open the create-mailing page, cancel/back actions must return to the list page, and continue/save actions must perform the expected validation or step transition when the required target state exists or can be safely inferred.
- All modals, dialogs, and modal-like overlays must open and close smoothly with tokenized CSS transitions; do not toggle `hidden` in the same frame as `is-open` changes when that would skip the closing animation.
- If Figma provides only one visual state but the control clearly implies missing behavior, implement the minimal expected behavior and state the assumption.

## Navigation Rules

- When creating a new standalone page, update the shared header/topbar, mobile menu, and footer links in affected HTML files so the page is reachable from navigation when possible.
- Use the real page URL for cross-page navigation, and keep active navigation states only on the current page.

## Breakpoints

- Desktop: `>= 1200px`
- Tablet: `768px - 1199.98px`
- Mobile: `< 768px`
- When Figma provides only wide desktop/tablet/mobile frames, add intermediate safeguards if the layout cannot physically fit between frames:
  - `1280px - 1475.98px`: desktop header composition with fluid side paddings
  - `1200px - 1279.98px`: compact desktop header/topbar
- For every new Figma block, explicitly check and support intermediate widths between supplied frames, especially `1200-1475.98px`, `834-1199.98px`, and `768-833.98px`, so elements do not overlap, crop, or drift while resizing.
- Figma container side paddings currently used by the header:
  - desktop: `var(--figma-container-px-desktop)` = `124px`
  - tablet: `var(--figma-container-px-tablet)` = `40px`
  - mobile: `var(--figma-container-px-mobile)` = `16px`

## Verification

- After layout changes, verify desktop, tablet, and mobile widths against the Figma nodes.
- For mobile screenshots on Windows headless Chrome, use DevTools device metrics override when ordinary `--window-size=393` crops the layout.
