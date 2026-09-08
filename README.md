# UjuziLab — Complete UI/UX Prototype

**TechStar UjuziLab** (branded as **UjuziHub**) — Africa's learning and innovation ecosystem.

This repository is a **production-ready UI/UX handoff** for backend developers. It implements the full interface from [UjuziLab_Blueprint.pdf](./UjuziLab_Blueprint.pdf) with mock data, ready to wire to Supabase.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What's included

| Area | Routes | Status |
|------|--------|--------|
| Public website | `/`, `/courses`, `/programs`, `/projects`, … | ✅ |
| Auth & onboarding | `/auth/*`, `/onboarding` | ✅ |
| Student portal | `/dashboard/*`, `/learn/*` | ✅ |
| Cart & checkout | `/cart`, `/checkout/*` | ✅ |
| Instructor portal | `/instructor/*` | ✅ |
| Organization portal | `/org/[slug]/*` | ✅ |
| Admin portal | `/admin/*` | ✅ |
| Innovation lab | `/dashboard/lab` | ✅ |

## Documentation for backend team

- **[Complete Flow Map](./docs/COMPLETE_FLOW_MAP.md)** — L0 platform → L5 atomic actions (every button)
- **[Backend Handoff](./docs/BACKEND_HANDOFF.md)** — API endpoints, flows, DB tables, env vars
- **[UI/UX Spec](./docs/UI_UX_SPEC.md)** — Screen-by-screen design specification
- **[Flows checklist](./docs/FLOWS_COMPLETE.md)** — Route test matrix
- **[Blueprint extract](./docs/blueprint-extract.txt)** — Full PDF text export

**In-app navigator:** [http://localhost:3000/flow-map](http://localhost:3000/flow-map) — interactive route tree

## Design system

- **Brand orange:** `#f39223` — sidebar, primary, CTAs, links
- **Logo:** `/public/ujuzilab-logo.svg` · wordmark `/public/ujuzilab-mark.svg`
- **UI library:** Material UI v9 + UjuziLab theme (`src/lib/ujuzi-brand.ts`)
- **Fonts:** Roboto (MUI default) + Inter + Poppins

## Demo accounts (password: `password123`)

| Role | Email | Landing page |
|------|--------|----------------|
| Student | `student@ujuzilab.com` | `/dashboard` |
| Instructor | `instructor@ujuzilab.com` | `/instructor/dashboard` |
| Platform admin | `admin@ujuzilab.com` | `/admin` |
| Org admin (DIT) | `orgadmin.dit@ujuzilab.com` | `/org/dit-tanzania/dashboard` |
| Org admin (Makerere) | `orgadmin.makerere@ujuzilab.com` | `/org/makerere-innovation-hub/dashboard` |
| Org admin (Kigali) | `orgadmin.kigali@ujuzilab.com` | `/org/kigali-stem-academy/dashboard` |
| Org admin (Nairobi) | `orgadmin.nairobi@ujuzilab.com` | `/org/nairobi-techstar/dashboard` |

Seed real platform content (7 courses, 3 kits, 4 institutions, projects, programs):

```bash
npm run db:seed
```

## Demo flows to test

1. **Browse → Enroll:** Home → Courses → Course detail → Add to cart → Checkout
2. **Learn:** Dashboard → Resume course → Course player → Next lesson
3. **Instructor:** `/instructor/dashboard` → Manage published courses
4. **Admin:** `/admin` — platform KPIs and payments table
5. **Organization:** `/org/dit-tanzania/dashboard` — kit inventory (admins only for settings/analytics/members)

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (cart, auth demo)
- Radix UI primitives

## Next steps (backend)

1. Create Supabase project and run migrations from Blueprint §3
2. Replace `src/data/mock` with Supabase client + TanStack Query
3. Implement Edge Functions listed in `docs/BACKEND_HANDOFF.md`
4. Connect Selcom payments and Bunny.net video

## License

Proprietary — TechStar UjuziLab © 2025–2026
