# WaziLab clone alignment

The `clones/` folder contains saved HTML from **WaziLab** (Waziup Training Centre). UjuziLab UI is aligned to match that reference.

## Clone inventory (42 files)

| Clone page | App route |
|------------|-----------|
| `Home___WaziLab.html` | `/` |
| `Courses___WaziLab.html` | `/courses` |
| `Program___WaziLab.html` | `/programs/[slug]` |
| `Introduction_to_IoT___WaziLab.html` | `/learn/[course]/[lesson]` |
| `Lab_Resources___WaziLab.html` | `/lab-resources` |
| `Organizations___WaziLab.html` | `/organizations` |
| `Projects___WaziLab.html` | `/projects` |
| `YouthTeamUp___WaziLab.html` | `/projects` (youth initiative content) |
| `Data_Gathering_*`, `5v_Single_Channel_Relay_*` | `/lab-resources/[slug]` |

## Design tokens (from HTML CSS)

| Token | Value | Usage |
|-------|-------|--------|
| Sidebar | `#394E69` | Left nav background |
| Primary | `#014361` | Buttons, headings |
| Accent | `#0C95AF` | Highlights, logo chip |
| Link | `#0288D1` | Text links |
| Surface | `#F5F5F5` | Page background |
| Border | `#D9D9D9` | Cards, dividers |
| Text muted | `#616161` | Secondary text |

## Layout

- **LabShell** — fixed left sidebar (250px / 64px collapsed), top bar, EU footer
- **Navigation order** — Home → Programs → Solutions → Courses → Lab Resources → Organizations → Projects

## Components

- `WaziLabContentCard` — course/solution card with **Join** + **Learn More**
- `WaziLabSection` — home page sections with “See all”
- Course player — **TOPICS** sidebar, **Mark Topic Done**, **Previous/Next Topic**

## Extraction script

```bash
node scripts/extract-wazilab.js
node scripts/extract-wazilab-structure.js
```

## 100% implementation (MUI parity)

The app now uses **@mui/material v9** with a theme copied from extracted clone CSS:

| Clone CSS | App implementation |
|-----------|-------------------|
| `rgb(57,78,105)` sidebar | `MuiDrawer` + `palette.primary.main` |
| Outlined button `border: 1px solid rgba(57,78,105,0.5)` | `MuiButton` `outlined` override |
| Card `border: 0.8px solid #d9d9d9; border-radius: 12px` | `MuiCard` override |
| `font: Roboto 0.8125rem uppercase` buttons | `typography.button` + theme |
| Drawer `width: 64px` + hover expand 250px | `MuiLabDrawer` |
| Logo PNG from clone | `/public/wazilab-logo.png` (extracted) |
| `margin-left: 64px` main | `LabPage-main` + `LabShell` |

**Key files:** `src/theme/wazilab-mui-theme.ts`, `MuiLabDrawer.tsx`, `LabShell.tsx`, `WaziLabContentCard.tsx`

## Minor remaining gaps

- Full 56 lab hardware item pages (clone has one HTML per item) — use `/lab-resources/[slug]` pattern
- Auth/onboarding pages — WaziLab colors, not re-saved from clone HTML
- MUI touch ripples — enabled by default on MUI buttons
