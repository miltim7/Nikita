# Project Layout Rules

This is a static HTML/CSS/JS landing project. Keep the codebase organized for a large Figma-to-code build.

## Source Of Truth

- Use Figma MCP nodes as the source for exact sizes, spacing, colors, typography, and assets.
- For pixel-perfect tasks, inspect all provided Figma variants before editing: desktop, tablet, and mobile.
- Match block dimensions, spacing, typography, element positioning, Bootstrap/container behavior, cards, buttons/forms, icons, colors, borders, shadows, and hover/focus states.
- Do not improve, simplify, redesign, add UI elements, or substitute a "similar" layout when the user asks for 1:1 Figma matching.
- The success criterion for these tasks is visual indistinguishability from Figma in all supplied responsive versions.
- Put reusable design values in `assets/styles/base/variables.css`.
- Do not introduce hardcoded colors, shadows, radii, font weights, or repeated spacing values in section files when a token already exists.
- Add missing project-wide tokens before using the same value in multiple sections.

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
