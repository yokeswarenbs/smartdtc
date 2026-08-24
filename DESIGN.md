# Design Brief

## Direction

SMARTDTC Operations Console — a refined, high-density light theme for a professional DTC public-transport control system, built for operators managing buses, crew and duties in real time.

## Tone

Industrial precision meets control-room clarity: crisp, dense, authoritative — a real transport authority interface, not a generic student website.

## Differentiation

A mono-font "data layer" (bus IDs, route codes, duty times in JetBrains Mono) plus a deep transport-authority blue primary and teal accent give the dashboard an authentic operations-console identity.

## Color Palette

| Token      | OKLCH          | Role                                    |
| ---------- | -------------- | --------------------------------------- |
| background | 0.985 0.006 235 | cool off-white app canvas               |
| foreground | 0.16 0.02 240  | primary ink text                        |
| card       | 1.0 0.003 235  | elevated card surface                   |
| primary    | 0.4 0.13 250   | deep transport blue (CTA, active)       |
| accent     | 0.62 0.12 200  | teal highlight                          |
| muted      | 0.955 0.008 235 | subtle fill                              |
| success    | 0.55 0.16 150  | available / on-time status              |
| warning    | 0.7 0.15 80    | maintenance / delay status              |
| destructive | 0.55 0.22 25  | critical / out-of-service status        |
| info       | 0.55 0.14 235  | informational status                    |

## Typography

- Display: Space Grotesk — headings, page titles, KPI numerals
- Body: DM Sans — UI labels, tables, paragraphs
- Mono: JetBrains Mono — bus IDs, route codes, duty times, timestamps
- Scale: hero `text-3xl font-bold tracking-tight`, h2 `text-xl font-semibold`, label `text-xs font-semibold uppercase tracking-wider`, body `text-sm`

## Elevation & Depth

Light layered surfaces with crisp 1px borders; cards sit on `shadow-subtle`, modals and dropdowns on `shadow-elevated`; no glow or neon.

## Structural Zones

| Zone    | Background  | Border   | Notes                                   |
| ------- | ----------- | -------- | --------------------------------------- |
| Sidebar | sidebar     | border-r | blue-tinted control panel, collapsible  |
| Header  | card        | border-b | breadcrumb, Demo Mode badge, actions    |
| Content | background  | —        | alternating card / muted sections       |
| Footer  | muted/40    | border-t | meta info, demo-data disclaimer         |

## Spacing & Rhythm

Dense desktop-first data grid: 4px micro-gaps, 6px between table cells, 16px card padding, 24px section gaps; consistent 4px base scale.

## Component Patterns

- Buttons: rounded-md, `bg-primary` for primary actions, subtle hover lift, `bg-muted` for secondary
- Cards: rounded-lg, `bg-card`, `shadow-subtle`, 1px `border-border`
- Badges: rounded-full pills with soft status tints (success/warning/destructive/info)
- Tables: dense rows, hover row tint, mono-font identifiers, sticky headers

## Motion

- Entrance: `animate-fade-in` 0.25s on page/section mount
- Hover: 0.15s background/opacity transitions on rows and buttons
- Decorative: `animate-pulse-soft` on live "Demo Mode" / status indicators only

## Constraints

- Token-only styling; no raw hex/rgb literals or arbitrary Tailwind colors in components
- Light theme primary; dark theme included for night control-room use
- Demo data clearly labelled and isolated for later backend replacement
- Frontend-only: no backend, database, auth, live APIs, GIS or AI

## Signature Detail

Mono-font operational identifiers (bus IDs, route codes, duty times) rendered in JetBrains Mono across all tables and KPI cards — the unmistakable "control console" fingerprint.
