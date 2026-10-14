---
name: Takt
description: Precision Task Command Center
colors:
  primary: "#f43f5e"
  primary-glow: "#ff4b55"
  secondary: "#a855f7"
  tertiary: "#4f46e5"
  gradient-magenta: "#ec4899"
  success: "#10b981"
  warning: "#f59e0b"
  neutral-canvas-dark: "#090b11"
  neutral-surface-low: "#0e131f"
  neutral-surface-med: "#131926"
  neutral-surface-high: "#192132"
  neutral-border-dark: "rgba(255, 255, 255, 0.1)"
  neutral-canvas-light: "#f8fafc"
  neutral-surface-light: "#ffffff"
  neutral-border-light: "#e2e8f0"
  neutral-text-dark: "#ffffff"
  neutral-secondary-dark: "#cbd5e1"
  neutral-muted-dark: "#94a3b8"
  neutral-text-light: "#0f172a"
  neutral-muted-light: "#64748b"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.015em"
  body:
    fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.012em"
  label:
    fontFamily: "'JetBrains Mono', monospace, ui-monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
  telemetry:
    fontFamily: "'JetBrains Mono', monospace, ui-monospace"
    fontSize: "0.625rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-glow}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-muted-dark}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  card-board:
    backgroundColor: "{colors.neutral-surface-med}"
    textColor: "{colors.neutral-text-dark}"
    rounded: "{rounded.lg}"
    padding: "14px 14px"
  input-field:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-dark}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Takt

## Overview

**Creative North Star: "The Obsidian Horology Lab"**

Takt is engineered as a high-precision, tactile command center. Drawing inspiration from precision horology and tactical instrumentation, the interface pairs deep titanium and obsidian voids with crisp hairline boundaries, calibrated typographic rhythm, and targeted luminous accents. It decisively rejects blurry, decorative neon glows, bloated enterprise tables, and sluggish interaction delays in favor of immediate, zero-latency feedback and crystalline contrast.

Every surface is built for intense cognitive focus. Dark mode is anchored in pitch obsidian (`#090b11`), layering subtle elevation steps (`#0e131f` to `#192132`) to establish clear hierarchy without relying on heavy muddy drop shadows. Typography is tracked tightly for architectural stability, using Plus Jakarta Sans for structural clarity and JetBrains Mono for telemetry, durations, and timestamps.

**Key Characteristics:**
- **Obsidian Architectural Contrast**: High-contrast tonal surfaces exceeding WCAG AAA standards for effortless legibility under long working sessions.
- **Cadence Accents**: Focused energy channeled through Precision Rose (`#f43f5e`), Cadence Violet (`#a855f7`), and Flow Emerald (`#10b981`), applied strictly where intention or status is communicated.
- **Tactile Physics**: Snappy spring physics (stiffness 350, damping 28) for drag operations, distinct relative drop indicators, and tactile button presses.
- **Zero-Friction Ergonomics**: Tight density, compact badge telemetry, and single-click or keyboard-driven workflows.

## Colors

The palette balances obsidian depths with high-chroma tactical indicators and high-clarity neutrals.

### Primary
- **Precision Rose** (`#f43f5e`): The signature cadence color. Used for high-priority task flags (P1), active focus Pomodoro states, and primary submission buttons.
- **Cadence Crimson** (`#ff4b55`): The radiant hover and glow variant of the primary hue, providing instant visual feedback on interactive triggers.

### Secondary
- **Cadence Violet** (`#a855f7`): The secondary progression accent. Marks active sprint milestones, section transitions, and the ribbon gradient tail.

### Tertiary
- **Flow Indigo** (`#4f46e5`): Deep analytical indicator used for effort estimation duration tags (`#duration`), calendar block horizons, and subtle gradient anchors.

### Status Accents
- **Flow Emerald** (`#10b981`): Complete state, success toasts, and checked task indicators.
- **Amber Pulse** (`#f59e0b`): Warning states, P2 urgent tasks, and deadline alerts.

### Neutral
- **Deep Void Obsidian** (`#090b11`): Base canvas background for dark mode.
- **Low Surface** (`#0e131f`): Bottom-tier containers and sidebar backdrops.
- **Nightshade Surface** (`#131926`): Standard elevated cards, swimlanes, and board surfaces.
- **High Surface** (`#192132`): Active modals, flyouts, and dropdown menus.
- **Hairline Border Dark** (`rgba(255, 255, 255, 0.1)`): Standard structural boundary separating surfaces (`rgba(255, 255, 255, 0.22)` on hover).
- **Canvas Light** (`#f8fafc`): Crisp slate canvas for daytime mode.
- **Surface Light** (`#ffffff`): Pure white elevated card surfaces for light mode.
- **Hairline Border Light** (`#e2e8f0`): Subtle grey divider for light mode (`#cbd5e1` on hover).
- **Light Placeholder Text** (`#64748b`): Calibrated to 4.6:1 WCAG AA contrast ratio against white/slate canvases.
- **Dark Placeholder Text** (`#94a3b8` / `zinc-400`): Calibrated to 6.5:1+ WCAG AAA contrast ratio on Nightshade surfaces.

### Named Rules
**The Cadence Accent Rule.** Luminous color accents (`#f43f5e`, `#a855f7`, `#10b981`) must occupy no more than 10% of any viewport. Chromatic saturation is an alert and focus signal; flooding surfaces with accent backgrounds destroys visual hierarchy.

**The Hairline Boundary Rule.** Structural separation is established by 1px hairline borders (`rgba(255,255,255,0.10)` on dark, `#e2e8f0` on light) rather than multi-layered blurred drop shadows.

**The Verified Contrast Rule.** All placeholder and secondary text must pass WCAG AA (minimum 4.5:1 for body and placeholders). Never use washed-out low-contrast grays (`zinc-500` on dark or `#94a3b8` on light canvas).

## Typography

**Display Font:** Plus Jakarta Sans (with fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)  
**Body Font:** Plus Jakarta Sans  
**Label/Mono Font:** JetBrains Mono (with fallback: `monospace, ui-monospace`)

**Character:** Architectural, disciplined, and legible. Headings feature tight negative tracking for muscular stability, while monospace numbers lend horological precision to time durations and keyboard shortcuts.

### Hierarchy
- **Display** (Bold 800, `clamp(2rem, 5vw, 3.5rem)`, line-height 1.1, letter-spacing `-0.03em`): Hero headlines and commanding section milestones.
- **Headline** (Bold 700, `1.5rem` / `24px`, line-height 1.25, letter-spacing `-0.02em`): Major modal headers, board swimlane titles, and view names.
- **Title** (Bold 700 / Semi-Bold 600, `1rem` / `16px`, line-height 1.35, letter-spacing `-0.015em`): Task titles, widget toggles, and drawer headers.
- **Body** (Regular 400, `0.875rem` / `14px`, line-height 1.5, letter-spacing `-0.012em`): Task descriptions, scratchpad editor text, and dialog instructions.
- **Label** (Semi-Bold 600, `0.6875rem` / `11px`, line-height 1.2, letter-spacing `0.04em`, uppercase where operational): Timestamps, keyboard shortcuts, priority badges, and ETA duration badges.

### Named Rules
**The Negative Tracking Rule.** Any heading or title above 14px must apply tight negative tracking (`-0.015em` to `-0.03em`) to eliminate typographic flabbiness and reinforce the architectural grid.

**The Monospace Telemetry Rule.** All numeric counters, timer countdowns, and duration values (`15m`, `2h 30m`) must be rendered in JetBrains Mono.

## Layout

Takt utilizes an ergonomic, dense grid structure optimized for rapid horizontal scanning across Kanban swimlanes and vertical time-blocking in the 7-day horizon:
- **Board Swimlanes**: Flexible multi-column grid with a minimum column width of 280px and comfortable 16px gutter spacing (`gap-4`).
- **Main Container**: Maximum content width clamped to 1440px (`max-w-7xl` or custom flex viewport) with 16px to 32px side padding.
- **Header & Command Bar**: Fixed 64px (`h-16`) navigation bar with sticky positioning, backdrop blur (`backdrop-blur-md`), and integrated search/filter controls.
- **Density**: Compact information density; padding in cards is balanced at 14px (`p-3.5`) to maximize visible cards per screen without cramped line-heights.

## Elevation & Depth

Depth is established primarily through **Tonal Layering** rather than heavy blurred drop shadows. By stepping surfaces from pitch void to elevated nightshade, elements feel physically sculpted into the screen.

### Shadow Vocabulary
- **Subtle Surface** (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`): Light mode card resting state.
- **Night Elevation** (`0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)`): Dark mode card resting state on `#131926`.
- **Drag Lift** (`0 10px 25px -5px rgba(0, 0, 0, 0.5)`): Active card elevation during HTML5 drag-and-drop.
- **Ambient Accent Glow** (`0 0 20px -3px rgba(244, 63, 94, 0.25)`): Subtle diffuse illumination for active Pomodoro countdowns and focused primary actions.

### Named Rules
**The Tonal Stepping Rule.** Visual depth rises sequentially: `Canvas (#090b11)` → `Container (#0e131f)` → `Card (#131926)` → `Modal/Dropdown (#192132)`. Never skip a tier or place lower-tier tones over higher-tier tones.

## Shapes

- **Base Radius**: 12px (`rounded-xl` / `0.75rem`) for cards, modal containers, and widgets.
- **Control Radius**: 8px (`rounded-lg` / `0.5rem`) for action buttons, inputs, and dropdown selectors.
- **Tag / Badge Radius**: 4px to 6px (`rounded-md`) for compact telemetry chips.
- **Pill Radius**: 9999px (`rounded-full`) for circular icons, avatars, and drop indicators.
- **Drop Indicator**: 4px rounded horizontal ribbon (`h-1 bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full animate-pulse`) signaling precise insertion targets between cards.

## Components

### Buttons
- **Shape:** Rounded rectangle (8px / `rounded-lg`).
- **Primary:** Background `#f43f5e`, text `#ffffff`, font-weight 700, padding `8px 16px`. Hover state shifts to `#ff4b55` with subtle lift.
- **Ghost / Neutral:** Background `transparent`, text `#94a3b8`, padding `6px 12px`. Hover state adds subtle surface tint (`bg-white/[0.08]` dark, `bg-slate-100` light) and illuminates text to `#ffffff`.
- **Destructive:** Background `transparent`, text `#f87171`. Hover state triggers soft crimson wash (`bg-rose-950/30`).

### Cards (Board & List)
- **Corner Style:** 12px radius (`rounded-xl`).
- **Background:** `#ffffff` (light) / `#131926` or `#161c2b` (dark).
- **Border:** 1px hairline border (`border-slate-200/90` light, `border-white/[0.12]` dark). Hover enhances border illumination to `border-white/[0.24]`.
- **Tactile Drag Affordance:** Integrated vertical 6-dot grip handle (`w-3.5 h-3.5`) visible in muted slate, transitioning to high-contrast white on card hover.
- **Check Affordance:** Instant checkbox toggle with emerald ring transition on complete (`text-emerald-500 fill-emerald-950/40`).

### Badges & Telemetry Chips
- **Priority P1:** Background `rgba(244, 63, 94, 0.15)`, text `#f43f5e`, border `1px solid rgba(244, 63, 94, 0.3)`.
- **Priority P2:** Background `rgba(245, 158, 11, 0.15)`, text `#f59e0b`, border `1px solid rgba(245, 158, 11, 0.3)`.
- **ETA Duration:** Background `rgba(79, 70, 229, 0.15)`, text `#818cf8`, JetBrains Mono font.

### Inputs & Form Fields
- **Style:** Clean border stroke (`border-white/[0.12]`), background `#0e131f` (dark) or `#ffffff` (light), 8px radius.
- **Focus:** Sharp 2px ring with zero offset in focus accent (`ring-2 ring-rose-500 border-transparent`).

### Navigation & Top Bar
- **Style:** 64px height, sticky top banner, 80% backdrop blur, hairline bottom border.
- **Brand Emblem:** Precision Takt Plate featuring dual-gradient metallic bevel, architectural crossbar, and cadence accent stem.

## Do's and Don'ts

### Do:
- **Do** preserve the high-contrast Obsidian dark mode hierarchy (`#090b11` canvas with `#131926` cards).
- **Do** format all time blocks, countdowns, and duration chips using monospace JetBrains Mono.
- **Do** use Framer Motion spring physics (`stiffness: 350, damping: 28`) for drag and layout animations.
- **Do** provide immediate hover and active tactile states on every interactive surface.
- **Do** ensure all text and icon contrasts surpass WCAG AA standards (4.5:1 for body, 3:1 for large text).

### Don't:
- **Don't** flood entire card backgrounds or columns with vibrant primary red or purple; reserve high chroma for badges, focus states, and primary CTAs.
- **Don't** use generic default system scrollbars; always apply the refined 5px semi-transparent custom scrollbar.
- **Don't** introduce heavy, fuzzy, multi-colored drop shadows that muddy the architectural lines.
- **Don't** build non-keyboard-accessible accordions or drag interactions; ensure full WAI-ARIA and focus-ring compliance.
