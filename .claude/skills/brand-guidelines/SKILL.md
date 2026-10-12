---
name: brand-guidelines
description: Applies NitOwl's brand colors, typography, radii and component conventions to any UI, component or artifact in this repo. Use it when building or styling components, choosing colors or fonts, or whenever NitOwl's look-and-feel or design tokens apply.
---

# NitOwl Brand Styling

## Overview

NitOwl is a code-review tool: a call graph of functions, reviewed in concentric "rings" of chunks, with pull requests queued in an inbox. The look is calm and technical: a warm off-white canvas, ink-black text, hairline borders, and three saturated state colors that carry all of the meaning.

Source of truth: Figma file "NitOwl" → page "Component Library" (`BsBC8aW4rwfax3VinLBUiP`). Implementation: `src/renderer/src/index.css`. If this doc and the CSS disagree, the CSS wins; update this doc.

**Keywords**: branding, visual identity, design tokens, shadcn, Tailwind, colors, typography, review states, Graph Node, Ring Tab, Action Button, PR Row

## Brand Guidelines

### Colors

**Neutrals:**

- Ink: `#1b1d23` (`--nitowl-ink`) - Primary text, primary button, dark surfaces
- Canvas: `#f6f5f1` (`--nitowl-canvas`) - Page and panel background (estimated from screenshot, verify in Figma)
- White: `#ffffff` - Cards, rows, popovers
- Line: `#dcd9d2` (`--nitowl-line`) - All borders and inputs
- Slate: `#8b8f9c` (`--nitowl-slate`) - Secondary text, metadata
- Mist: `#a8abb2` (`--nitowl-mist`) - Tertiary text, "not started"
- Locked: `#bdbfc4` (`--nitowl-locked`) - Locked graph nodes and tabs

**State Colors** (color means status; never use them decoratively):

- Indigo: `#4b40ee` (`--nitowl-indigo`) - Active, current, "your turn", focus ring
- Teal: `#12a594` (`--nitowl-teal`) - Approved, done; tint `#eaf7f3` for done backgrounds
- Orange: `#ff7a45` (`--nitowl-orange`) - Flagged, request changes, destructive

### Typography

- **UI text** (titles, buttons, body): Space Grotesk Medium (`font-sans`)
- **Code and data** (PR numbers, metadata, function names, ring tabs, badges): JetBrains Mono Medium/Bold (`font-mono`)
- Both are bundled locally via `@fontsource-variable/*`; the Electron CSP blocks external fonts, so never link a CDN font.

| Token | Size | Used for |
| --- | --- | --- |
| `text-meta` | 11px | PR meta line, badges |
| `text-label` | 12px | Graph node labels, tab counts |
| `text-tab` | 13px | PR number, ring label |
| `text-body` | 15px | PR title, action buttons |

### Radii

Base `--radius` is 10px (Action Button).

- `rounded-sm` 7px - Badges
- `rounded-md` 9px - Ring tabs
- `rounded-lg` 10px - Buttons
- `rounded-xl` 12px - Cards and PR rows

### Borders and elevation

- 1px solid `border` (`#dcd9d2`) on cards, rows, locked tabs and outline badges
- No shadows in the current design; separation comes from borders and the canvas/white contrast
- Documentation panels use a dashed border

## Token Reference

Use semantic tokens in components, never raw hex.

| Token (Tailwind) | Light value | Meaning |
| --- | --- | --- |
| `background` / `foreground` | Canvas / Ink | Page |
| `card` / `card-foreground` | White / Ink | Rows, panels |
| `primary` / `primary-foreground` | Ink / White | Default button ("approve chunk") |
| `muted-foreground` | Slate | Secondary text |
| `subtle-foreground` | Mist | Tertiary text |
| `locked-foreground` | Locked | Locked state |
| `active` | Indigo | Active / current / your turn |
| `accent` | Neutral hover surface | shadcn hover/selected background (menus, toggles); **not** a brand color |
| `success`, `success-tint` | Teal, Teal tint | Approved / done |
| `flagged`, `destructive` | Orange | Flagged / request changes |
| `border`, `input` | Line | Borders |
| `ring` | Indigo | Focus ring |

## Component Conventions

### Graph Node (a function in the call graph)

15px dot with a 12px JetBrains Mono Medium label beneath. A 34px halo ring sits around the dot in some states.

- **Locked**: Locked-grey dot and label (future ring)
- **Active**: Ink dot, solid indigo halo, ink label (reviewable now)
- **Current**: Indigo dot, dashed indigo halo, indigo label (open in the panel)
- **Approved**: Teal dot with a white bold `✓` (you signed off)
- **Flagged**: Orange dot, orange halo, orange label (you requested changes)

### Ring Tab (one ring of the review)

`R1` in 13px Bold plus count in 12px Medium. Padding 14×9, radius 9px.

- **Locked**: 1px Line border, Mist text
- **Active**: Indigo fill, white text, count at 82% opacity
- **Done**: Teal-tint fill, teal text

### Action Button (chunk-level decision)

Space Grotesk Medium 15px, white text, padding 24×16, radius 10px, lowercase labels.

- **Approve** ("approve chunk"): Ink fill
- **Approved**: Teal fill
- **Request changes**: Orange fill; opens a note

### PR Row (a pull request in the inbox)

White card, 1px Line border, radius 12px, padding 18×20 (22 left), 16px gap. A 9px pip, then `#482` (mono Bold 13) + title (sans Medium 15), a mono 11px meta line below in Slate, and a status badge on the right.

- **Your turn**: Indigo pip, Ink title, indigo-filled badge with white text
- **Queued**: Slate pip, Ink title, outline badge (Slate text)
- **Not started**: Mist pip, Slate title, outline badge (Mist text)
- **Done**: Teal pip, Slate title, teal-tint badge with teal text

## Voice

- Lowercase labels and badges: "approve chunk", "request changes", "your turn"
- Terse and technical; mono for anything that is code, an identifier or a count

## Dark Mode

Light, dark and system are supported (`ThemeProvider`, `ThemeSwitcher`; the choice persists in `localStorage` under `nitowl-theme`, and `system` follows the OS live). The theme is the `.dark` class on `<html>`; every component must use semantic tokens so it themes for free.

Figma has no dark theme yet, so dark is derived from the light palette: same hues, ink-based surfaces. Replace the values when dark designs exist.

| Token | Light | Dark |
| --- | --- | --- |
| `background` | `#f6f5f1` | `#121317` |
| `card` | `#ffffff` | `#1b1d23` (Ink) |
| `popover`, `muted`, `secondary` | Canvas / white | `#20222a` |
| `accent` (hover surface) | `#eeede7` | `#272a33` |
| `foreground`, `primary` | Ink | `#f3f2ee` (primary button inverts: light fill, ink text) |
| `muted-foreground` | `#8b8f9c` | `#9a9eab` |
| `border`, `input` | `#dcd9d2` | `#2e313a` |
| `active` / `ring` | `#4b40ee` | `#6b62ff` / `#7a72ff` |
| `success` | `#12a594` | `#1fb8a6`, tint = 18% teal |
| `flagged`, `destructive` | `#ff7a45` | `#ff8a5b` (ink text on fill) |

Rule: state colors are lifted slightly in dark to hold contrast on dark surfaces; neutrals follow the ladder background < card < popover/muted < accent.

## Technical Details

### Using the tokens

- Tokens live in `src/renderer/src/index.css`: raw palette (`--nitowl-*`) → shadcn semantic tokens → `@theme inline` Tailwind mapping
- Write `bg-success-tint text-success`, not `bg-[#eaf7f3] text-[#12a594]`
- Merge classes with `cn()` from `@renderer/lib/utils`; build variants with `cva`
- shadcn config is in `components.json` (components in `src/renderer/src/components/ui`); add components with `npx shadcn@latest add <name>`
- Generated shadcn components pick up the brand through tokens (`bg-primary`, `border-border`, `ring-ring`, `rounded-*`). After adding one, check for hard-coded `text-sm` (use `text-body`/`text-tab`/`text-meta`), `shadow-*` (the design has none) and `rounded-full` on badges (NitOwl uses `rounded-sm`)
- NitOwl-specific components (`GraphNode`, `RingTab`, `PrRow`) live in `src/renderer/src/components`; `Button` and `Badge` carry the extra `active`, `success` and `flagged` variants
- `src/renderer/src/gallery.tsx` is the living component gallery. It is only reachable from the native menu: NitOwl → Settings… (⌘,) on macOS, File → Settings… (Ctrl+,) elsewhere, then the Components tab
- `Logo` (`components/logo.tsx`) renders `assets/owl-solid.png` / `owl-outline.png` as a mask, so it takes `currentColor`. App icons in `build/` and `resources/` are the solid owl in Canvas on an Ink rounded square
- The window is frameless (`hiddenInset` on macOS, `hidden` + overlay elsewhere); `TitleBar` is the drag region

### Adding to the system

- New color: add a `--nitowl-*` raw value, map it to a semantic token, then expose it in `@theme inline`
- A state color must map to an existing review state; do not introduce new hues for decoration
- Keep this doc in sync with `index.css` and the Figma Component Library
