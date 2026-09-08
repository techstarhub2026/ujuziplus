# UjuziLab — Complete UI/UX Specification

> **Brand:** TechStar UjuziLab (external: UjuziHub)  
> **Vision:** Africa's learning + innovation ecosystem — not just video courses.

---

## 1. Information architecture

```
PUBLIC (marketing)
├── Home, Courses, Programs, Projects, Competitions
├── Learning Kits, Solutions, Lab Resources
├── Organizations, Community, Blog, About, Pricing, Contact
└── Auth (login, register, forgot/reset password)

AUTHENTICATED — Student
├── Dashboard (home base)
├── My Learning → Course Player
├── Learning Kits (catalog + detail)
├── Innovation Lab (split-screen labs)
├── Programs, Competitions, Community, Resources
├── Organizations, Certificates, Profile/Settings
└── Cart → Checkout → Success/Failed

INSTRUCTOR
├── Dashboard, Course Builder (6 steps + kit linking)
├── Analytics, Earnings, Students, Grade assignments

ORGANIZATION
├── Overview, Members, Courses, Learning Kits (inventory + requests)
├── Programs, Competitions, Analytics, Settings (logo + SSO)

MODERATOR
├── Course review queue, Content reports, Community moderation

SUPER ADMIN
├── KPIs, Users, Courses, Learning Kits (5-tab editor)
├── Orgs, Payments, Moderation, Analytics, Settings
```

---

## 2. Design system (Blueprint §32)

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (brand) | `#f39223` | CTAs, sidebar, links, active nav (UjuziLab orange) |
| Primary Light | `#fef3e6` | Backgrounds, badges |
| Accent | `#7C3AED` | Innovation, projects, instructor highlights |
| Success | `#16A34A` | Completion, passed quiz |
| Warning | `#D97706` | Pending, draft, expiry |
| Error | `#DC2626` | Errors, failed payment |
| Text Primary | `#111827` | Headings, body |
| Text Secondary | `#6B7280` | Captions, meta |
| Background | `#F9FAFB` | Page background |

### Typography

- **UI:** Inter (16px base)
- **Headings:** Poppins (hero, page titles)
- **Code:** JetBrains Mono (labs, editor)

### Components

- **Cards:** `rounded-xl`, `shadow-sm`, `border-gray-100`, hover `shadow-md`
- **Buttons:** Primary (filled blue), Secondary (outline), Accent (violet)
- **Inputs:** `rounded-lg`, focus ring `ring-brand`
- **Radius:** Cards 12px, buttons 8px, badges full

### Breakpoints

- Mobile `<768px`: stack, bottom nav (future), sticky CTA on course detail
- Tablet `768–1024px`: 2-col grids, collapsible sidebar
- Desktop `>1024px`: full sidebar + 3–4 col grids

---

## 3. Screen-by-screen UX

### 3.1 Homepage `/`

| Section | Content | CTA |
|---------|---------|-----|
| Hero | Headline + stats bar | Start Learning, Start Teaching |
| Featured courses | 4 cards horizontal/grid | View all |
| **Learning kits** | 3 published kit cards | See all kits |
| **Solutions** | 3 IoT solution cards with join state | See all solutions |
| Categories | 8 icon cards | Filter catalog |
| How it works | 3 steps: Learn → Build → Innovate | — |
| Innovation showcase | Project cards | Explore projects |
| Partners | Org logos | — |
| CTA banner | Join ecosystem | Create account |

### 3.2 Course catalog `/courses`

- Search (debounced 300ms → API)
- Filters: category, level, price (free/paid), language, rating
- Sort: newest, popular, rating, price
- Active filter chips (removable)
- Grid 24/page, infinite scroll or pagination

### 3.3 Course detail `/courses/[slug]`

**Desktop:** 2-col — content left, sticky purchase card right  
**Mobile:** bottom sticky Enroll bar

| Block | Elements |
|-------|----------|
| Hero | Preview video play, title, rating, enrollments |
| Learn list | Checkbox grid |
| Curriculum | Accordion modules, free preview badges |
| Instructor | Avatar, bio, stats |
| Sidebar | Price, discount, Enroll, Wishlist, includes list |

**Button: Enroll Free** → `/learn/...`  
**Button: Add to Cart** → `/cart`

### 3.3a Learning kits `/kits` and `/kits/[slug]`

| Screen | Elements | Actions |
|--------|----------|---------|
| Catalog | Search, category/difficulty chips, grid of `KitCard` | Open kit detail |
| Detail tabs | Overview, BOM (component table), Materials (PDF/video links), Projects, Gallery | Start learning (toast), request for school |

Admin kit editor (`/admin/kits/*`): 5 tabs — Basic info, Components (BOM), Materials, Media gallery, Related courses + publish toggle. Uses `ImageUploadField` for thumbnails.

### 3.3b Solutions `/solutions` and `/solutions/[slug]`

- Filter chips: All, Joined, Beginner/Intermediate/Advanced
- Join Solution → `joinSolution` persisted; badge on joined cards
- Detail page: build steps, required kit link, workspace CTA

### 3.3c Lab resources `/lab-resources`

- Filter by Hardware / Software / Dataset / API
- Detail page with documentation and download mock

### 3.4 Auth

| Screen | Fields | Actions |
|--------|--------|---------|
| Login | email, password | Sign in, Google OAuth, forgot link |
| Register | name, email, password, role radio | Create account → onboarding |
| Onboarding | interests (multi), goal (radio) | 4-step wizard → dashboard |

### 3.5 Student dashboard `/dashboard`

| Widget | Data |
|--------|------|
| Greeting | `profiles.full_name` |
| Stats cards | active courses, certs, innovation score, rank |
| Continue learning | last course, progress %, Resume |
| Active project | stage, mentor deadline |
| Upcoming events | hackathons, deadlines |
| Recommended | RPC `get_recommended_courses` |

### 3.6 Course player `/learn/[courseSlug]/[lessonSlug]`

```
┌─────────────┬──────────────────────┬─────────────┐
│ Curriculum  │   Video / Article    │ Notes/Q&A/  │
│  sidebar    │   Quiz / Assignment  │ Resources   │
│  (tree)     │                      │  panel      │
├─────────────┴──────────────────────┴─────────────┤
│        Previous lesson  |  Next lesson           │
└──────────────────────────────────────────────────┘
```

- **Video:** Bunny HLS, speed, captions, resume position, 85% = complete
- **Quiz:** intro → questions → submit confirm → results breakdown
- **Assignment:** drag-drop upload, draft/submit, status tracker
- **AI Mentor:** floating panel (Phase 3)
- **Keyboard:** Space, F, ←/→

### 3.7 Innovation lab `/dashboard/lab`

Split screen:
- **Left:** step-by-step instructions
- **Right:** code editor + simulation (Monaco/IoT Phase 3)

### 3.8 Checkout `/checkout`

1. Order summary (from cart — server validates prices)
2. Payment method: M-Pesa, Airtel, Tigo, Card
3. Phone input (mobile money) or card fields
4. Pay → Selcom redirect → poll → success

### 3.9 Instructor course builder

6-step stepper:

1. **Basic Info** — title, subtitle, Tiptap description, category, thumbnail
2. **Curriculum** — modules DnD, lessons (video/article/quiz/assignment)
3. **Requirements** — learning objectives (max 8), prerequisites
4. **Pricing** — free/paid TZS, discount, visibility
5. **SEO & Certificate** — meta, template toggle
6. **Review** — checklist, preview, submit → `pending_review`

Auto-save every 30s.

### 3.10 Admin `/admin`

- KPI cards: users, active today, revenue MTD, courses
- Revenue chart (daily/weekly/monthly)
- Recent payments table
- User/course/org management tables with filters

---

## 4. Interaction patterns

| Pattern | Behavior |
|---------|----------|
| Toast | Success/error on form submit |
| Confirm dialog | Quiz submit, delete, payout request |
| Empty state | Illustration + CTA when no data |
| Loading | Skeleton cards on catalog |
| Optimistic UI | Wishlist, lesson complete, upvotes |
| Realtime | Notification bell via Supabase Realtime |

---

## 5. Mobile strategy (Africa-first)

- Bottom nav (student dashboard): Home, Learn, **Kits**, Community, Profile
- Low-bandwidth: compressed thumbnails, optional video quality
- Mobile money as primary checkout path
- Offline downloads (Phase 2 mobile app)

---

## 6. Accessibility

- Focus rings on all interactive elements
- `aria-label` on icon buttons
- Color contrast WCAG AA on primary buttons
- Form labels associated with inputs

---

## 7. File reference (prototype)

All routes implemented under `src/app/` (**95 routes** — see `/flow-map`). Run `npm run dev` and visit:

- Public: http://localhost:3000
- Kits: http://localhost:3000/kits
- Solutions: http://localhost:3000/solutions
- Dashboard: http://localhost:3000/dashboard (auto-logged in for demo)
- Instructor: http://localhost:3000/instructor/dashboard
- Admin kits: http://localhost:3000/admin/kits
- Org kits: http://localhost:3000/org/techstar-university/kits
- Flow map: http://localhost:3000/flow-map
- Course player: http://localhost:3000/learn/arduino-robotics-fundamentals/introduction
