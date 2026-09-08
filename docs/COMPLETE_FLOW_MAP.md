# UjuziLab — Complete Flow Map (High → Low)

> **Purpose:** Single source of truth from platform vision down to every button, route, modal, and store action.  
> **Live navigator:** Run the app → open [`/flow-map`](http://localhost:3000/flow-map) or [`/sitemap`](http://localhost:3000/sitemap) (redirects to flow-map).

---

## L0 — Platform (whole organism)

```
UjuziLab = Learning + Innovation + Community + Commerce
├── Public marketing & discovery (no login)
├── Authenticated learning (student)
├── Content creation (instructor)
├── Institutional ops (organization)
├── Trust & safety (moderator)
├── Platform ops (super admin)
└── Cross-cutting: Auth, Cart/Checkout, Search, Notifications, Toasts, Modals
```

**Global behaviors (every portal):**

| Layer | Mechanism | Persistence |
|-------|-----------|-------------|
| Auth | `authStore` — auto-demo login as William Mwangi | `localStorage` |
| App state | `appStore` — enrollments, wishlist, notes, quiz, assignments | `ujuzi-app` |
| Cart | `cartStore` — line items, coupon `UJUZI20` | `ujuzi-cart` |
| UX feedback | `showToast`, `ModalRoot` (confirm, form, share, receipt) | session |
| Role switch | `RoleSwitcher` bar — jump portals without re-login | — |

---

## L1 — Portals & entry points

| Portal | Base routes | Who |
|--------|-------------|-----|
| Public | `/`, `/courses`, `/programs`, … | Everyone |
| Student | `/dashboard/*`, `/learn/*` | Learner |
| Instructor | `/instructor/*` | Course author |
| Organization | `/org/[slug]/*` | TechStar University (demo) |
| Moderator | `/moderator/*` | Content reviewer |
| Admin | `/admin/*` | Super admin |
| Commerce | `/cart`, `/checkout/*` | Buyer |
| Utility | `/search`, `/flow-map`, `/profile/[username]` | All |

---

## L2 — Modules per portal

### Public module map

| Module | Routes | Primary actions |
|--------|--------|-----------------|
| Home | `/` | CTAs → courses, register, program cards |
| Catalog | `/courses` | Search, category/level/price filters, **sort** (popular/rating/newest/price) |
| Course detail | `/courses/[slug]` | Enroll free, add cart, wishlist, preview curriculum |
| **Learning kits** | `/kits`, `/kits/[slug]` | Filter catalog; detail tabs: Overview, BOM, Materials, Projects, Gallery; request for school |
| **Solutions** | `/solutions`, `/solutions/[slug]` | Level/joined filters; join workspace; link to required kit |
| **Lab resources** | `/lab-resources`, `/lab-resources/[slug]` | Hardware/Software/Dataset/API filters; resource detail |
| Programs | `/programs`, `/programs/[slug]` | **Filter** All/Bootcamp/Program/Incubator |
| Projects | `/projects`, `/projects/[slug]` | View, support |
| Competitions | `/competitions`, `/competitions/[slug]` | Register (simulated) |
| Orgs | `/organizations`, `/organizations/[slug]` | Browse partners |
| Community preview | `/community` | Teaser → login |
| Blog | `/blog`, `/blog/[slug]` | Read articles |
| Legal | `/privacy`, `/terms` | Static |
| Auth | `/auth/*`, `/onboarding` | Login → dashboard; Register → onboarding |
| Verify | `/verify-certificate` | Lookup cert ID |
| Pricing / About / Contact | respective routes | Forms → toast |

### Student module map

| Module | Routes | Primary actions |
|--------|--------|-----------------|
| Dashboard | `/dashboard` | Stats, resume learning, **streak calendar**, **announcements**, events |
| My courses | `/dashboard/my-courses` | Continue → learn player |
| Learn player | `/learn/[course]/[lesson]` | Video/quiz/assignment, notes, Q&A, downloads, AI mentor, mark complete |
| Lab | `/dashboard/lab` | Step checklist, mark complete, run simulation |
| Wishlist | `/dashboard/wishlist` | **Enroll / add cart / remove** |
| Certificates | `/dashboard/certificates`, `[certId]` | View, share |
| Community | `/dashboard/community/*` | Channels, posts |
| Settings | `/dashboard/settings/*` | Profile, account, notifications, billing, privacy |
| Programs / Competitions / Resources / Orgs / Projects | under `/dashboard/` | Deep links to public or create flows |

### Instructor module map

| Module | Routes | Primary actions |
|--------|--------|-----------------|
| Dashboard | `/instructor/dashboard` | KPIs, quick actions |
| Courses | `/instructor/courses` | List, new, edit |
| Course builder | `new`, `[id]/edit` | 6 steps; **+ Lesson**, **Edit** → form modal; submit review |
| Preview | `[id]/preview` | Opens public course with `?preview=instructor` |
| Analytics | per-course + global | Charts (mock) |
| Students | list + `[studentId]` | Progress |
| Grade | `/instructor/assignments/grade` | Rubric, feedback, publish grade |
| Earnings | `/instructor/earnings` | Payout history |

### Organization (demo: `techstar-university`)

| Route | Actions |
|-------|---------|
| `/org/.../dashboard` | Org KPIs |
| `/org/.../members` | Invite, roles |
| `/org/.../courses` | **Manage assignment** modal |
| `/org/.../kits` | **Inventory** + **kit requests** (orgKitStore) |
| `/org/.../programs` | Assign programs |
| `/org/.../competitions` | Host events |
| `/org/.../analytics` | **Export CSV** → toast |
| `/org/.../settings` | Branding, SSO placeholders |

### Moderator & Admin

| Portal | Key flows |
|--------|-----------|
| Moderator | Approve/reject course (`reject` modal), request changes, reports queue |
| Admin | Users CRUD, course/org oversight, **learning kits CRUD (5-tab editor)**, payments, moderation hub, analytics, settings |

---

## L3 — Page-level user journeys

### Journey A: Guest → enrolled student (free course)

1. `/` → **Start Learning** → `/courses`
2. Filter/sort → open `/courses/arduino-robotics-fundamentals`
3. **Enroll Free** → `appStore.enrollFree` → toast → `/learn/.../introduction`
4. Watch video → **Mark complete** → `markLessonComplete`
5. Next lesson → quiz → `QuizPlayer` submit → pass/fail toast
6. Assignment → upload → submit → status in `assignmentStatus`
7. Finish → `/dashboard/certificates`

### Journey B: Paid course via mobile money

1. Course detail → **Add to cart** → `/cart`
2. Apply coupon `UJUZI20` → `/checkout`
3. Select M-Pesa / Airtel / Tigo / Card → Pay → `/checkout/success` or `failed`
4. Receipt modal (`receipt`) on success

### Journey C: Instructor publishes course

1. `/instructor/courses/new` → steps 1–6
2. Curriculum: Add module, **+ Lesson**, **Edit** lesson forms
3. Step 6 **Submit for review** → toast → `/instructor/courses`
4. Moderator `/moderator/courses` → Approve or Reject with reason

### Journey D: Organization assigns course

1. `/org/techstar-university/courses`
2. **Manage assignment** → form (deadline, cohort) → toast

### Journey E: School requests learning kits

1. `/org/techstar-university/kits` → **Request kits** tab
2. Submit form (kit name, quantity, notes) → toast → appears in requests list
3. **Inventory** tab → update on-hand / allocated counts

### Journey F: Learner explores kit → linked course

1. `/kits` → filter by category → `/kits/arduino-starter-kit`
2. Tabs: BOM, Materials (open PDF/video mock), Projects, Gallery
3. **Start learning** → toast; optional link to linked course in course builder

### Journey G: Join IoT solution workspace

1. `/solutions` → filter by level → **Join Solution**
2. `joinSolution` persisted in `appStore` → `/solutions/[slug]` for build steps
3. Home page solutions section reflects joined badge

---

## L4 — Screen regions & components

### Course player layout (atomic regions)

```
┌ Header: back | type badge | AI Mentor | Mark complete ─────────┐
├ Sidebar: module/lesson list (completion checkmarks) ─────────────┤
├ Main: video | article | QuizPlayer | AssignmentPanel ────────────┤
├ Footer: Previous | Next | Finish course ─────────────────────────┤
└ Right panel (video): Notes | Q&A (post question) | Downloads ────┘
     └ Floating: AI Mentor chat (Send → toast)
```

### Dashboard layout

```
┌ Topbar: menu (mobile drawer) | search | notifications | avatar ─┐
├ Sidebar (desktop) / MobileSidebar (drawer) ────────────────────────┤
├ Content: welcome, stat cards, continue learning ─────────────────┤
├ Row: LearningStreak | Announcements | Active project ────────────┤
├ Events card ─────────────────────────────────────────────────────┤
└ Recommended courses (CourseCard grid) ───────────────────────────┘
├ MobileNav (bottom tabs) ─────────────────────────────────────────┘
```

### Public header

- Logo → `/`
- **Search** → `/search?q=`
- Nav links + **Flow map** → `/flow-map`
- Cart badge → `/cart`
- Login / Sign up or Dashboard / Teach

---

## L5 — Atomic actions (button → effect)

| UI control | Location | Effect |
|------------|----------|--------|
| Enroll Free | Course detail | `enrollFree` + navigate learn |
| Add to cart | Course detail / wishlist | `cartStore.addItem` |
| Heart / wishlist | Course detail | `toggleWishlist` |
| Enroll / Remove | Wishlist card | enroll or cart + `toggleWishlist` |
| Mark complete | Learn player | `markLessonComplete` |
| Post question | Learn Q&A tab | toast success |
| Download | Learn resources | toast mock download |
| Mark step complete | Innovation lab | local step state + toast |
| Export CSV | Org analytics | toast |
| Manage assignment | Org courses | form modal |
| + Lesson / Edit | Course builder | form modal |
| Submit for review | Builder step 6 | toast + redirect |
| Approve / Reject | Moderator | confirm / reject modal |
| Pay | Checkout | navigate success/failed |
| Coupon UJUZI20 | Cart | 20% discount |
| Role switcher | Global bar | `router.push` portal home |
| Hamburger menu | Dashboard topbar | `MobileSidebar` open |
| Join solution | Solutions catalog / home | `joinSolution` + toast |
| Register program | Dashboard programs | `registerProgram` + toast |
| Register team | Dashboard competitions | `registerCompetition` + toast |
| Kit request | Org kits | `orgKitStore` + form modal |
| Save notifications | Settings notifications | `notificationPrefs` persist |
| Save privacy | Settings privacy | `privacyPrefs` persist |
| Upload avatar/logo | Profile / org settings | `ImageUploadField` mock CDN URL |
| Admin kit save | Kit editor 5 tabs | `kitStore` CRUD persist |

---

## Route inventory (95 routes)

See `src/lib/flows.ts` → `ALL_ROUTES` for the canonical list. Interactive links with demo slugs: **`/flow-map`**.

---

## Backend handoff

When wiring Supabase / Selcom / Bunny.net, map each L5 action to an API in `docs/BACKEND_HANDOFF.md`. UI already exposes the contract via stores and modals.

---

## Verification checklist

- [ ] Open `/flow-map` — all demo links load (including kits, solutions, org kits)
- [ ] Mobile: hamburger opens student nav drawer; bottom nav includes Kits tab
- [ ] Wishlist: enroll + remove works
- [ ] Programs filters change list; dashboard register persists
- [ ] Competitions: dashboard register persists
- [ ] Solutions: join state persists on home + catalog
- [ ] Kits: catalog filters, detail tabs, admin CRUD
- [ ] Courses sort changes order
- [ ] Lab steps increment with toast
- [ ] Learn: Q&A, download, mark complete
- [ ] Org: CSV + assignment modals + kit inventory/requests
- [ ] Settings: notifications + privacy save to localStorage
- [ ] Profile: avatar upload mock; public profile fallback for unknown usernames
- [ ] Search: courses, kits, programs, solutions, competitions
- [ ] Builder: lesson add/edit modals; step 3 kit linking
- [ ] Checkout with coupon and payment methods
