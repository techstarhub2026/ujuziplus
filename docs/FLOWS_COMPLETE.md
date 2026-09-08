# UjuziLab — 100% UI Flow Coverage

All **60 routes** build successfully. Every primary button triggers a real UI action (toast, navigation, or state change). Data persists in `localStorage` via Zustand for demo purposes.

## How to test end-to-end

```bash
npm run dev
```

You are auto-logged in as **William Mwangi**. Toast notifications appear bottom-right on actions.

---

## Public website (16 routes)

| Route | Working flows |
|-------|----------------|
| `/` | Hero CTAs → courses/register; category cards filter; project links |
| `/courses` | Search, filters, sort, course cards → detail |
| `/courses/[slug]` | Enroll free/paid, wishlist toggle, preview lessons, reviews |
| `/programs` | Program cards |
| `/projects` | Grid → project detail |
| `/projects/[slug]` | Gallery, GitHub link, comments CTA |
| `/competitions` | List → dashboard register |
| `/organizations` | Org cards → public org page |
| `/organizations/[slug]` | Org profile → org admin portal |
| `/community` | Preview → register |
| `/pricing` | Plan select → toast; FAQ |
| `/about` | Static content |
| `/contact` | Form submit → toast |
| `/verify-certificate` | Enter `UJZ-2026-00142` → valid result |
| `/auth/login` | Sign in → dashboard |
| `/auth/register` | Sign up → onboarding |
| `/auth/forgot-password` | Email → toast |
| `/auth/reset-password` | Password → login |
| `/privacy`, `/terms` | Legal pages |
| `/onboarding` | 4-step wizard → dashboard |

## Commerce (4 routes)

| Route | Flow |
|-------|------|
| `/cart` | View items, coupon `UJUZI20`, remove, checkout |
| `/checkout` | M-Pesa/Airtel/Tigo/Card → pay → success |
| `/checkout/success` | Go to courses / start learning |
| `/checkout/failed` | Retry / back to cart |

## Student portal (20 routes)

| Route | Flow |
|-------|------|
| `/dashboard` | Stats, resume learning, projects, events |
| `/dashboard/my-courses` | Tabs, continue → player |
| `/learn/[course]/[lesson]` | Video player, quiz (full state machine), assignment upload, notes, AI mentor, mark complete, prev/next |
| `/dashboard/certificates` | List, download/share buttons |
| `/dashboard/wishlist` | From course heart icon |
| `/dashboard/programs` | Register → toast |
| `/dashboard/competitions` | Register team → toast |
| `/dashboard/community` | Channels → posts |
| `/dashboard/community/[slug]` | Create post, upvote |
| `/dashboard/resources` | Download → toast |
| `/dashboard/organizations` | Open org portal |
| `/dashboard/lab` | Split-screen lab |
| `/dashboard/projects` | List → detail |
| `/dashboard/projects/new` | 5-step submit → publish |
| `/dashboard/notifications` | Mark read / all read |
| `/dashboard/settings/*` | Profile, account, notifications, billing, privacy |

**Mobile:** Bottom nav (Home, Learn, Projects, Community, Profile)

## Instructor (8 routes)

| Route | Flow |
|-------|------|
| `/instructor/dashboard` | KPIs, create course |
| `/instructor/courses` | List, edit, analytics |
| `/instructor/courses/new` | 6-step builder, submit review |
| `/instructor/analytics` | Charts placeholder |
| `/instructor/earnings` | Payout request → toast |
| `/instructor/students` | Progress table |

## Organization (7 routes)

| Route | Flow |
|-------|------|
| `/org/techstar-university/dashboard` | KPIs, activity |
| `/org/.../members` | Invite, CSV, table |
| `/org/.../courses` | Assign courses |
| `/org/.../programs` | Programs list |
| `/org/.../competitions` | Competitions |
| `/org/.../analytics` | Export CSV |
| `/org/.../settings` | Branding save |

## Moderator (3 routes)

| Route | Flow |
|-------|------|
| `/moderator` | Overview |
| `/moderator/courses` | Approve / reject / request changes |
| `/moderator/reports` | Dismiss / warn / remove |

## Admin (8 routes)

| Route | Flow |
|-------|------|
| `/admin` | Platform KPIs, payments |
| `/admin/users` | Suspend / activate |
| `/admin/courses` | Approve pending |
| `/admin/organizations` | Manage orgs |
| `/admin/payments` | Refund |
| `/admin/moderation` | Links to moderator |
| `/admin/analytics` | Charts |
| `/admin/settings` | Feature flags, API keys |

## Profile

| Route | Flow |
|-------|------|
| `/profile/[username]` | Public portfolio |

---

## Persistent demo state (localStorage)

- `ujuzi-app` — enrollments, wishlist, lesson notes, quiz scores, assignments
- `ujuzi-cart` — cart items

## Image warnings fixed

- `priority` on above-fold LCP images
- `sizes` on all `fill` images via `OptimizedImage` component

## What backend still adds

Real Supabase auth, Bunny video, Selcom payments, PDF certificates, email — UI is ready to wire per `BACKEND_HANDOFF.md`.
