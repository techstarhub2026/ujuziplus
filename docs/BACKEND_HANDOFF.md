# UjuziLab — Backend Developer Handoff

This document accompanies the **UjuziLab UI prototype** (`ujuzilab-ui`). Every screen, button, and form maps to the [UjuziLab_Blueprint.pdf](../UjuziLab_Blueprint.pdf) specification.

## What you receive

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Runnable UI prototype | `src/app/**` | All pages & flows with mock data |
| TypeScript types | `src/types/app.ts` | Entity shapes for API contracts |
| Mock data | `src/data/mock/index.ts` | Replace with Supabase queries |
| Design tokens | `tailwind.config.ts`, Blueprint §32 | Colors, typography, spacing |
| This handoff doc | `docs/BACKEND_HANDOFF.md` | Integration guide |

## Tech stack (from Blueprint)

- **Frontend:** Next.js 14, TypeScript, Tailwind, Zustand, TanStack Query (add when wiring API)
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime, Edge Functions)
- **Payments:** Selcom (M-Pesa, Airtel, Tigo, Cards)
- **Video:** Bunny.net (HLS streaming)
- **Email:** Resend

---

## User roles & route access

| Role | Routes | RLS requirement |
|------|--------|-----------------|
| `student` | `/dashboard/*`, `/learn/*`, `/cart`, `/checkout` | Own enrollments & progress |
| `instructor` | `/instructor/*` | Own courses & earnings |
| `organization_admin` | `/org/[slug]/*` | Org members & org courses |
| `moderator` | `/moderator/*` | Review queue, reports |
| `super_admin` | `/admin/*` | Full platform |
| Public | `(public)/*` | Published courses only |

---

## Complete page map → API endpoints

### Public website

| Page | Route | Backend needs |
|------|-------|---------------|
| Homepage | `/` | `GET courses?featured=true`, stats RPC `get_platform_stats()` |
| Course catalog | `/courses` | `GET courses` with filters: category, level, price, language, rating, sort, pagination |
| Course detail | `/courses/[slug]` | `GET courses?slug=`, curriculum join modules+lessons, reviews, `enrollment` check |
| Learning kits | `/kits` | `GET kits?status=published` with filters: category, difficulty, search, pagination |
| Kit detail | `/kits/[slug]` | `GET kits?slug=` with joins: `kit_components`, `kit_materials`, `kit_gallery`, related courses |
| Programs | `/programs` | `GET programs` (Phase 2) |
| Projects showcase | `/projects` | `GET projects?visibility=public` |
| Organizations | `/organizations` | `GET organizations?verified=true` |
| Pricing | `/pricing` | `GET subscription_plans` (Phase 2) |
| Verify certificate | `/verify-certificate` | `GET certificates?number=` |
| Login | `/auth/login` | Supabase `signInWithPassword`, `signInWithOAuth(Google)` |
| Register | `/auth/register` | Supabase `signUp`, trigger → `profiles` insert |
| Onboarding | `/onboarding` | `POST /functions/v1/auth/onboard` |

### Student portal

| Page | Route | Backend needs |
|------|-------|---------------|
| Dashboard | `/dashboard` | Enrollments, progress, recommendations RPC, notifications |
| My courses | `/dashboard/my-courses` | `enrollments` + `courses` join, filter by status |
| Course player | `/learn/[courseSlug]/[lessonSlug]` | Lessons, `lesson_progress`, video URL from Bunny, notes CRUD |
| Certificates | `/dashboard/certificates` | `certificates` where user_id |
| Innovation lab | `/dashboard/lab` | Lab resources (Phase 2/3) |
| Cart | `/cart` | Client state → validate courses exist & prices server-side |
| Checkout | `/checkout` | `POST /functions/v1/payments/initiate` |
| Checkout success | `/checkout/success` | Poll `GET /functions/v1/payments/:id/status` |

### Instructor portal

| Page | Route | Backend needs |
|------|-------|---------------|
| Dashboard | `/instructor/dashboard` | RPC `get_instructor_stats(instructor_id)` |
| Course builder | `/instructor/courses/new` | Full course CRUD, modules, lessons, Bunny upload ticket, **linked kit slugs** |
| Analytics | `/instructor/analytics` | Per-course completion, revenue, drop-off |
| Earnings | `/instructor/earnings` | `instructor_balance`, payout requests |
| Students | `/instructor/students` | Enrollments filtered by instructor's courses |

### Organization portal

| Page | Route | Backend needs |
|------|-------|---------------|
| Org dashboard | `/org/[slug]/dashboard` | Org-scoped analytics |
| Members | `/org/[slug]/members` | `POST /functions/v1/orgs/invite`, members CRUD |
| Learning kits | `/org/[slug]/kits` | `org_kit_inventory`, `org_kit_requests` CRUD + approve workflow |

### Admin portal

| Page | Route | Backend needs |
|------|-------|---------------|
| Dashboard | `/admin` | RPC `get_admin_kpis()` |
| Users | `/admin/users` | profiles + roles, suspend, impersonate |
| Courses | `/admin/courses` | Force publish/unpublish |
| Learning kits | `/admin/kits` | Kit CRUD: BOM, materials, gallery, publish workflow |
| Kit editor | `/admin/kits/new`, `/admin/kits/[kitId]/edit` | `POST/PATCH kits` + nested resources, image upload via Storage/Bunny |
| Payments | `/admin/payments` | All transactions, refunds, Selcom webhook logs |

---

## Critical user flows (sequence)

### 1. Free enrollment

```
User clicks "Enroll Free" on /courses/[slug]
  → POST /functions/v1/enrollments/create { course_id }
  → Insert enrollments (source: free)
  → Redirect to /learn/[slug]/[first-lesson]
```

### 2. Paid enrollment (Selcom)

```
Add to cart → /cart → /checkout
  → POST /functions/v1/payments/initiate
  → Redirect to Selcom checkout_url
  → Webhook POST /functions/v1/payments/webhook (verify HMAC)
  → Create enrollment, send email, notification
  → Frontend polls status → /checkout/success
```

### 3. Lesson progress & certificate

```
Video watch events every 10s → UPDATE lesson_progress.watch_time_seconds
At 85% watched → status = completed
Trigger recalculate_enrollment_progress
At 100% + quizzes passed + assignments submitted
  → POST /functions/v1/certificates/generate
  → PDF to Storage, email via Resend
```

### 4. Course publish workflow

```
Instructor: draft → Submit for Review
  → status = pending_review
Moderator approves → published
  → Notify instructor, create course Q&A channel
```

### 5. Quiz flow (state machine)

```
idle → intro → active → submitted → result
POST /functions/v1/quizzes/grade on submit
If passed → mark lesson complete
```

---

## Database tables (minimum for Phase 1 UI)

See Blueprint §3. Priority tables:

- `profiles`, `roles`, `user_roles`
- `courses`, `modules`, `lessons`, `categories`
- `kits`, `kit_components`, `kit_materials`, `kit_gallery_images`
- `enrollments`, `lesson_progress`, `quiz_attempts`, `assignment_submissions`
- `payments`, `transactions`
- `certificates`, `certificate_templates`
- `notifications`
- `reviews` (Phase 2)

### Learning kits schema (Phase 1 UI)

```sql
-- kits: catalog item (SparkFun/Arduino Education-style)
create table kits (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  description text,
  thumbnail_url text,
  category text not null,
  difficulty text check (difficulty in ('beginner','intermediate','advanced')),
  age_range text,
  price numeric(10,2) default 0,
  is_free boolean default false,
  status text check (status in ('draft','published','archived')) default 'draft',
  inventory_count int default 0,
  learning_outcomes jsonb default '[]',
  project_ideas jsonb default '[]',
  related_course_slugs text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table kit_components (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references kits(id) on delete cascade,
  name text not null,
  quantity int default 1,
  description text,
  image_url text,
  sort_order int default 0
);

create table kit_materials (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references kits(id) on delete cascade,
  title text not null,
  type text check (type in ('guide','video','pdf','worksheet','project')),
  description text,
  url text,
  duration_minutes int,
  sort_order int default 0
);

create table kit_gallery_images (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid references kits(id) on delete cascade,
  url text not null,
  caption text,
  is_primary boolean default false,
  sort_order int default 0
);
```

**REST endpoints**

| Endpoint | Method | Notes |
|----------|--------|-------|
| `GET /kits` | GET | Public: `status=published`; admin: all statuses |
| `GET /kits/:slug` | GET | Full kit with nested components, materials, gallery |
| `POST /admin/kits` | POST | Create kit (super_admin) |
| `PATCH /admin/kits/:id` | PATCH | Update kit + replace nested arrays |
| `DELETE /admin/kits/:id` | DELETE | Soft-delete or archive |
| `POST /admin/kits/:id/publish` | POST | Set status = published |
| `POST /admin/kits/:id/duplicate` | POST | Clone kit as draft |

Images: upload to Supabase Storage or Bunny CDN; store URLs on `kits.thumbnail_url`, `kit_gallery_images.url`, `kit_components.image_url`.

**Prototype UI:** `ImageUploadField` (`components/ui/ImageUploadField.tsx`) simulates upload — wire to `POST /functions/v1/media/upload-ticket` returning a signed upload URL, then persist the final CDN URL.

### Course ↔ kit linking (Phase 1 UI)

```sql
-- Option A: array on courses (matches prototype CourseBuilder)
alter table courses add column linked_kit_slugs text[] default '{}';

-- Option B: junction table (normalized, preferred at scale)
create table course_kits (
  course_id uuid references courses(id) on delete cascade,
  kit_id uuid references kits(id) on delete cascade,
  is_required boolean default true,
  primary key (course_id, kit_id)
);
```

| UI | Prototype behavior | Backend |
|----|-------------------|---------|
| `CourseBuilder` step 3 | Checkbox list → `linkedKitSlugs` state | `PATCH courses` or replace `course_kits` rows |
| `KitEditor` tab 5 | `relatedCourseSlugs[]` | Sync both directions or derive from `course_kits` view |

### Organization kit inventory & requests (Phase 2 UI, prototype ready)

```sql
create table org_kit_inventory (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  kit_id uuid references kits(id),
  quantity_on_hand int default 0,
  quantity_allocated int default 0,
  reorder_level int default 5,
  updated_at timestamptz default now(),
  unique (organization_id, kit_id)
);

create table org_kit_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id),
  kit_id uuid references kits(id),
  requested_by uuid references profiles(id),
  quantity int not null,
  status text check (status in ('pending','approved','fulfilled','rejected')) default 'pending',
  notes text,
  created_at timestamptz default now()
);
```

| Endpoint | Method | Notes |
|----------|--------|-------|
| `GET /org/:slug/kits/inventory` | GET | Org admin RLS |
| `PATCH /org/:slug/kits/inventory/:id` | PATCH | Adjust on-hand / allocated |
| `POST /org/:slug/kits/requests` | POST | Student or org admin request |
| `PATCH /org/:slug/kits/requests/:id` | PATCH | Approve / reject / fulfill |

**Zustand prototype stores:** `useKitStore` (`ujuzi-kits`), `useOrgKitStore` (`ujuzi-org-kits`) — replace with TanStack Query + Supabase.

---

## Edge Functions to implement

| Function | Method | Triggered by |
|----------|--------|--------------|
| `payments/initiate` | POST | Checkout |
| `payments/webhook` | POST | Selcom |
| `payments/:id/status` | GET | Poll after payment |
| `enrollments/create` | POST | Free enroll |
| `certificates/generate` | POST | 100% progress |
| `videos/upload-ticket` | POST | Instructor video upload |
| `media/upload-ticket` | POST | Kit gallery, thumbnails, component images |
| `videos/webhook` | POST | Bunny.net encoding done |
| `quizzes/grade` | POST | Quiz submit |
| `courses/publish` | POST | Submit for review |
| `auth/onboard` | POST | Onboarding complete |
| `notifications/send` | POST | Internal |
| `search` | POST | Global search |
| `analytics/instructor` | GET | Instructor dashboard |
| `analytics/admin` | GET | Admin dashboard |

---

## Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Edge Functions only
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=
SELCOM_API_KEY=
SELCOM_API_SECRET=
SELCOM_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
PLATFORM_FEE_RATE=0.30
CERTIFICATE_NUMBER_PREFIX=UJZ
```

---

## Replacing mock data

1. Add `@supabase/supabase-js` and create `src/lib/supabase/client.ts`
2. Replace imports from `@/data/mock` with TanStack Query hooks in `src/hooks/`
3. Remove `AuthProvider` auto-login; use `supabase.auth.onAuthStateChange`
4. Add middleware in `src/middleware.ts` for protected routes

Example query for course catalog:

```typescript
const { data } = await supabase
  .from('courses')
  .select(`*, instructor:profiles(username, full_name, avatar_url), category:categories(name, slug)`)
  .eq('status', 'published')
  .eq('visibility', 'public')
  .order('created_at', { ascending: false })
  .range(0, 23);
```

---

## UI component → data binding

| Component | File | Binds to |
|-----------|------|----------|
| `CourseCard` | `components/courses/CourseCard.tsx` | `Course` type |
| `CoursePlayer` | `app/learn/.../page.tsx` | `lessons`, `lesson_progress` |
| `NotificationBell` | `components/layout/AppTopbar.tsx` | `notifications` + Realtime |
| `Cart` | `store/cartStore.ts` | Validate on checkout server-side |
| `CourseBuilder` | `instructor/courses/new` | `courses`, `modules`, `lessons`, `linked_kit_slugs` |
| `KitCard` | `components/kits/KitCard.tsx` | `Kit` type |
| `KitEditor` | `admin/kits/new`, `admin/kits/[kitId]/edit` | `kits`, nested BOM/materials/gallery |
| `ImageUploadField` | `components/ui/ImageUploadField.tsx` | Mock → `media/upload-ticket` |
| `KitCatalog` | `(public)/kits/page.tsx` | `usePublishedKits()` → `GET /kits` |
| `KitDetail` | `(public)/kits/[slug]/page.tsx` | `useKitBySlug()` → `GET /kits/:slug` |
| `OrgKitsPage` | `org/[slug]/kits/page.tsx` | `useOrgKitStore` → inventory + requests APIs |

---

## Phase alignment

| Phase | UI pages ready | Backend priority |
|-------|----------------|------------------|
| **Phase 1** | Auth, courses, player, payments, instructor builder, admin, certs | Full Supabase schema + Selcom + Bunny |
| **Phase 2** | Community, org portal, projects, subscriptions | Organizations, channels, Typesense |
| **Phase 3** | AI mentor widget, IoT lab, coding editor | Claude API, device_readings table |

---

## Contact & references

- Blueprint: `UjuziLab_Blueprint.pdf` (73 pages)
- UI spec notes: `docs/blueprint-extract.txt`
- Design system: Blueprint §32 — Primary `#1E40AF`, Accent `#7C3AED`
