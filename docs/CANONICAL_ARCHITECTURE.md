# CANONICAL PLATFORM ARCHITECTURE

Status: BASELINE-2 GO (lint PASS / tsc PASS / build PASS / tests PASS). Route-collision recovery complete. EnrollButton stub is pre-existing and non-blocking.

This document is the source of truth for future implementation. It describes ACTUAL current repository architecture. Where intended product architecture differs, CURRENT / TARGET / GAP / REQUIRED FUTURE PHASE are marked explicitly. No invented functionality.

---

## 1. TECHNOLOGY STACK

Verified from `lms/package.json` and source:

- Next.js 16.3.4 (App Router, Turbopack)
- React 19.2.8
- TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/postcss`, `tailwindcss`)
- Plus Jakarta Sans (`next/font/google` in root layout)
- lucide-react, framer-motion, clsx, tailwind-merge
- UI primitives (uncommitted): Button, Card, Input, Textarea, Select, Badge, EmptyState, Skeleton, Avatar, Breadcrumb, Progress, Modal, Tabs, Tooltip in `src/components/ui/`
- Prisma 6.19.3 + Neon PostgreSQL (`DATABASE_URL`, `DIRECT_URL`)
- NextAuth v4.24.15 JWT strategy, CredentialsProvider (bcryptjs) + optional GoogleProvider, account linking by email in `src/services/auth/googleAuth.service.ts`; `secret: process.env.AUTH_SECRET`
- Razorpay 2.9.8 (`src/services/payments/razorpay.service.ts` + webhook route)
- GSAP: NOT installed
- Deployment: GitHub to Vercel; build script `prisma generate && next build`
- Tests: vitest 3

---

## 2. APPLICATION LAYERS

Public site
  -> Auth (NextAuth credentials + JWT session)
    -> Role-specific workspace (Student / Instructor / Admin)
      -> Domain server actions / route handlers
        -> Prisma
          -> Neon PostgreSQL

Classroom is a separate layer under `/classroom/[courseId]/[lessonId]`. Access requires authenticated identity AND ACTIVE enrollment.

---

## 3. CANONICAL ROUTE MAP

Route groups do not appear in URLs. Physical path -> URL:

| URL | Physical Route | Layout | Auth | Role | Purpose | Status |
|---|---|---|---|---|---|---|
| `/` | `(public)/page.tsx` | root | no | public | Home | CURRENT |
| `/courses` | `(public)/courses/page.tsx` | root | no | public | Catalog | CURRENT |
| `/courses/[slug]` | `(public)/courses/[courseId]/page.tsx` | root | optional | public | Course detail | CURRENT (param is courseId, not slug) |
| `/about` | `(public)/about/page.tsx` | root | no | public | About | CURRENT |
| `/about-us` | `about-us/page.tsx` | root | no | public | Team-ish about | CURRENT (TARGET `/about/team` does not exist) |
| `/community` | `(public)/community/page.tsx` | root | no | public | Community | CURRENT |
| `/contact` | `contact/page.tsx` | root | no | public | Contact | CURRENT |
| `/faq` | `faq/page.tsx` | root | no | public | FAQ | CURRENT |
| `/login` | `(auth)/login/page.tsx` | root | no | public | Login | CURRENT |
| `/register` | `(auth)/register/page.tsx` | root | no | public | Register | CURRENT |
| `/dashboard` | `(student)/dashboard/page.tsx` | student | yes | STUDENT | Learner hub | CURRENT (real data) |
| `/my-learning` | `(student)/my-learning/page.tsx` | student | layout only | intended STUDENT | Enrolled courses | CURRENT stub / GAP |
| `/progress` | `(student)/progress/page.tsx` | student | layout only | intended STUDENT | Progress | CURRENT stub / GAP |
| `/assignments` | `(student)/assignments/page.tsx` | student | layout only | intended STUDENT | Assignments | CURRENT stub / GAP |
| `/quizzes` | `(student)/quizzes/page.tsx` | student | layout only | intended STUDENT | Quizzes | CURRENT stub / GAP |
| `/notes` | `(student)/notes/page.tsx` | student | layout only | intended STUDENT | Notes | CURRENT stub / GAP |
| `/certificates` | `(student)/certificates/page.tsx` | student | layout only | intended STUDENT | Certificates | CURRENT stub / GAP |
| `/profile` | `(student)/profile/page.tsx` | student | layout only | intended STUDENT | Profile | CURRENT stub / GAP |
| `/instructor` | `(instructor)/instructor/page.tsx` | instructor | yes | INSTRUCTOR | Teaching studio | CURRENT (real assigned courses) |
| `/instructor/courses` | `(instructor)/instructor/courses/page.tsx` | instructor | layout only | intended INSTRUCTOR | Course list | CURRENT stub / GAP |
| `/instructor/courses/new` | TARGET | instructor | yes | INSTRUCTOR | Create course | GAP (create page not confirmed after recovery) |
| `/instructor/courses/[id]` | `(instructor)/instructor/courses/[courseId]/page.tsx` | instructor | yes | INSTRUCTOR scoped | Course authoring | CURRENT (real CRUD) |
| `/instructor/courses/[id]/lessons` | `(instructor)/courses/[courseId]/lessons/page.tsx` | instructor | layout only | intended INSTRUCTOR | Lessons | CURRENT stub / GAP (URL missing /instructor prefix) |
| `/instructor/courses/[id]/resources` | `(instructor)/courses/[courseId]/resources/page.tsx` | instructor | layout only | intended INSTRUCTOR | Resources | CURRENT stub / GAP (URL missing /instructor prefix) |
| `/instructor/courses/[id]/quizzes` | `(instructor)/courses/[courseId]/quizzes/page.tsx` | instructor | layout only | intended INSTRUCTOR | Quizzes | CURRENT stub / GAP (URL missing /instructor prefix) |
| `/instructor/courses/[id]/assignments` | `(instructor)/courses/[courseId]/assignments/page.tsx` | instructor | layout only | intended INSTRUCTOR | Assignments | CURRENT stub / GAP |
| `/instructor/courses/[id]/students` | `(instructor)/courses/[courseId]/students/page.tsx` | instructor | layout only | intended INSTRUCTOR | Students | CURRENT stub / GAP |
| `/instructor/courses/[id]/analytics` | `(instructor)/courses/[courseId]/analytics/page.tsx` | instructor | layout only | intended INSTRUCTOR | Analytics | CURRENT stub / GAP |
| `/instructor/profile` | `(instructor)/instructor/profile/page.tsx` | instructor | layout only | intended INSTRUCTOR | Profile | CURRENT stub / GAP |
| `/admin` | `(admin)/admin/page.tsx` | admin | yes | ADMIN | Control center | CURRENT (real counts) |
| `/admin/users` | `(admin)/admin/users/page.tsx` | admin | layout only | intended ADMIN | Users | CURRENT stub / GAP |
| `/admin/students` | `(admin)/admin/students/page.tsx` | admin | layout only | intended ADMIN | Students | CURRENT stub / GAP |
| `/admin/instructors` | `(admin)/admin/instructors/page.tsx` | admin | layout only | intended ADMIN | Instructors | CURRENT stub / GAP |
| `/admin/courses` | `(admin)/admin/courses/page.tsx` | admin | layout only | intended ADMIN | Courses | CURRENT stub / GAP |
| `/admin/courses/[courseId]` | `(admin)/courses/[courseId]/page.tsx` | admin | yes | ADMIN | Manage course | CURRENT (real page; URL is /courses/[courseId] unless nested under /admin) |
| `/admin/enrollments` | `(admin)/admin/enrollments/page.tsx` | admin | layout only | intended ADMIN | Enrollments | CURRENT stub / GAP |
| `/admin/orders` | `(admin)/admin/orders/page.tsx` | admin | layout only | intended ADMIN | Orders | CURRENT stub / GAP |
| `/admin/payments` | `(admin)/admin/payments/page.tsx` | admin | layout only | intended ADMIN | Payments | CURRENT stub / GAP |
| `/admin/certificates` | `(admin)/admin/certificates/page.tsx` | admin | layout only | intended ADMIN | Certificates | CURRENT stub / GAP |
| `/admin/community` | `(admin)/admin/community/page.tsx` | admin | layout only | intended ADMIN | Community | CURRENT stub / GAP |
| `/admin/settings` | `(admin)/admin/settings/page.tsx` | admin | layout only | intended ADMIN | Settings | CURRENT stub / GAP |
| `/classroom/[courseId]/[lessonId]` | `classroom/[courseId]/[lessonId]/page.tsx` | root | yes | enrolled user | Classroom | CURRENT (real; TARGET `/learn/[slug]/[lesson]` does not exist) |
| `/verify/[certificateNumber]` | `verify/[certificateNumber]/page.tsx` | root | no | public | Certificate verify | CURRENT |
| `/certificate/[certificateId]` | `certificate/[certificateId]/page.tsx` | root | no | public | Certificate view | CURRENT |

Route count (page.tsx files found): 38.
Workspace count: 5 (public, auth, student, instructor, admin) plus classroom.

IMPORTANT CURRENT vs TARGET gaps:

- TARGET `/about/team` does not exist. CURRENT equivalent is `/about-us`.
- TARGET classroom `/learn/[courseSlug]/[lessonSlug]` does not exist. CURRENT is `/classroom/[courseId]/[lessonId]`.
- TARGET `/courses/[slug]` CURRENT uses `[courseId]` even though Course.slug exists.
- Several instructor nested pages still live under `(instructor)/courses/[courseId]/...` which resolves to `/courses/[courseId]/...`, colliding with public course URLs unless those files are unused after the nested `/instructor/courses` copies. This is a remaining structural risk.
- Student/instructor/admin subpages exist as honest stubs; they do not yet implement full product behavior.
- Several stub pages are not themselves calling `authorizeRole`. They inherit workspace chrome from the group layout, but the layout currently uses client `useSession` and does NOT enforce server-side role. Page-level server guards exist on `/dashboard`, `/instructor`, `/admin`, classroom, and course manage pages.

---

## 4. NEXT.JS ROUTE GROUP RULES

Parentheses groups do not contribute a URL segment.

- `(student)/dashboard` -> `/dashboard`
- `(instructor)/instructor` -> `/instructor`
- `(admin)/admin` -> `/admin`
- `(public)/courses` -> `/courses`

Forbidden: `(instructor)/page.tsx` or `(admin)/page.tsx` because those resolve to `/` and collide with public home.

Invariant: no two physical pages may resolve to the same URL. Verified by recovery work; remaining risk is leftover `(instructor)/courses/[courseId]/*` files that still resolve under `/courses/...`.

---

## 5. LAYOUT ARCHITECTURE

- Root `app/layout.tsx`: Plus Jakarta Sans, SessionProvider, HTML/body. No workspace nav.
- Public: uses root layout + Navbar/Footer on home. No dedicated `(public)/layout.tsx`.
- Auth: no dedicated `(auth)/layout.tsx`. Login/register are client pages under root layout.
- Student `(student)/layout.tsx`: WorkspaceHeader + StudentNavMenu + main. Client hooks (`useSession`, `signOut`). Does not itself call `authorizeRole`.
- Instructor `(instructor)/layout.tsx`: WorkspaceHeader + InstructorNavMenu + main. Same client-session pattern.
- Admin `(admin)/layout.tsx`: WorkspaceHeader + AdminNavMenu + main. Same client-session pattern.

Navigation is role-specific and must not be treated as authorization.

---

## 6. AUTHENTICATION

Actual chain:

1. `/login` client form (`signIn` from next-auth/react).
2. `src/app/auth.ts` CredentialsProvider.authorize: looks up User by email, bcrypt.compare against `passwordHash`, returns `{ id, email, name, role }`.
3. JWT strategy in `src/lib/auth/config.ts`. `secret: process.env.AUTH_SECRET`. Google OAuth enabled when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set; Google sign-ins upsert/link the user by email and are gated on `isActive`.
4. jwt callback copies `id` and `role` onto token.
5. session callback copies `id`, `role`, email, name onto `session.user` as AuthUser.
6. `getServerSession(authConfig)` in helpers.
7. `getCurrentUser()` returns session user or null.
8. Route authorization: `authorizeRole` (redirect `/login` or `notFound()`), `requireRole` (throw), `requireCourseEditor` (ADMIN or assigned INSTRUCTOR).

IMPORTANT CURRENT GAP: `authConfig` CredentialsProvider.authorize returns null. Live credentials validation is in `src/app/auth.ts`, which NextAuth handler uses via `src/app/api/auth/[...nextauth]/route.ts` re-export. Do not use `authConfig.providers` as the live authorize implementation.

Demo login buttons prefill email only. They do not select a client role. Role comes from the authenticated User row.

---

## 7. ROLE PERMISSION MATRIX

| Capability | Student | Instructor | Admin |
|---|---|---|---|
| Public browsing | ALLOW | ALLOW | ALLOW |
| Dashboard `/dashboard` | ALLOW (page guard login only, not exact STUDENT) | ALLOW if logged in | ALLOW if logged in |
| Student hub stubs | NOT ENFORCED at page level | NOT ENFORCED | NOT ENFORCED |
| Classroom | SCOPED to ACTIVE enrollment | SCOPED to ACTIVE enrollment | SCOPED to ACTIVE enrollment |
| Course creation | DENY / NOT IMPLEMENTED on student | CURRENT create route GAP after recovery | CURRENT create exists historically as ADMIN create |
| Course editing | DENY | SCOPED via CourseInstructor | ALLOW via requireCourseEditor ADMIN bypass |
| Course publishing | DENY | SCOPED | ALLOW |
| Student management | DENY | NOT IMPLEMENTED (stub) | NOT IMPLEMENTED (stub) |
| Analytics | DENY | NOT IMPLEMENTED (stub) | NOT IMPLEMENTED |
| User management | DENY | DENY | NOT IMPLEMENTED (stub page; dashboard counts exist) |
| Instructor management | DENY | DENY | PARTIAL (assignInstructor historically; current admin actions file is a stub getAdminCourseData) |
| Payments / orders UI | DENY | DENY | NOT IMPLEMENTED (stub pages; models exist) |
| Certificates UI | NOT IMPLEMENTED (stub) | DENY | NOT IMPLEMENTED (stub); public verify exists |
| Community admin | DENY | DENY | NOT IMPLEMENTED (stub) |
| Settings | DENY | DENY | NOT IMPLEMENTED (stub) |

Do not claim page-level STUDENT-only enforcement on `/dashboard`. Current dashboard only requires login via `getCurrentUser()` + redirect. Instructor/Admin dashboards use `authorizeRole`.

---

## 8. CRITICAL RBAC RULE

Client-side navigation visibility is NOT authorization.

Role cannot be trusted from localStorage, sessionStorage, query strings, URL values, hidden inputs, or client state.

Authorization must happen server-side via session JWT role copied from the User row at login, then `authorizeRole` / `requireRole` / `requireCourseEditor` / enrollment checks.

CURRENT GAP: workspace layouts use client `useSession` and do not enforce role. Any page under `(student)`, `(instructor)`, or `(admin)` that lacks its own server guard is not fully authorized. This is a required future phase: add server `authorizeRole` to every protected page or convert layouts to server layouts that call the guard.

---

## 9. COURSE LIFECYCLE

Prisma `CourseStatus`: DRAFT, PUBLISHED, ARCHIVED.

CURRENT flow:

DRAFT
  -> instructor/admin authors modules, lessons, resources, quizzes, assignments
  -> `publishCourse` server action: requireCourseEditor, validate title/description, then set PUBLISHED
  -> PUBLISHED courses appear in public catalog via `getPublishedCourses`
  -> later updates remain possible on assigned editors

No separate readiness/prevalidation entity exists. Publish is a single action with basic validation.

---

## 10. COURSE OWNERSHIP

`CourseInstructor` is a composite unique `(courseId, userId)`.

`requireCourseEditor(courseId)`:

- unauthenticated -> throw Unauthorized
- ADMIN -> allow
- INSTRUCTOR with matching CourseInstructor row -> allow
- otherwise throw Forbidden

An instructor cannot edit another instructor's course unless assigned. Admin override is explicit.

---

## 11. ENROLLMENT LIFECYCLE

Locked product decision:

FREE:
Course (PUBLISHED and price == 0) -> `enrollInFreeCourse` -> Enrollment ACTIVE -> classroom access.

PAID:
Course -> Razorpay order -> verified payment/webhook -> Enrollment ACTIVE -> classroom access.

Payment status is not the classroom authorization boundary. Enrollment is.

CURRENT GAP: `(public)/courses/[courseId]/enrollment-actions.ts` currently stubs `enrollFree` as `{ success: true }` and `createPaymentOrder` as `{ id: 'test' }`. Real enrollment logic lives in `src/services/enrollmentService.ts`. Public EnrollButton currently depends on the stub actions. Restoring real actions is a required future phase and is the historical EnrollButton typing issue.

---

## 12. CLASSROOM AUTHORIZATION

CURRENT classroom page:

- getCurrentUser; redirect `/login` if missing
- hasCourseAccess(user.id, courseId); notFound if missing course or not enrolled
- lesson must exist in the course module tree

Classroom actions (`saveNote`, `submitAssignment`, `updateProgress`, `submitQuiz`) also check enrollment via the lesson -> module -> course chain.

TARGET `/learn/[courseSlug]/[lessonSlug]` is NOT implemented.

---

## 13. PAYMENT ARCHITECTURE

CURRENT:

- `razorpay.service.ts` constructs Razorpay client from `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` and throws if missing.
- Webhook `POST /api/payments/razorpay/webhook` verifies HMAC with `RAZORPAY_WEBHOOK_SECRET`.
- Idempotency via `WebhookEvent.providerEventId` with RECEIVED / PROCESSING / PROCESSED / FAILED handling.
- On `payment.captured`, locates Order by `providerOrderId` and continues paid-state processing.

Runtime configuration only. Do not commit secrets. Production Razorpay env remains a separate verification blocker.

---

## 14. SERVER ACTION / API BOUNDARIES

AUTH: `src/app/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/auth/register/route.ts`
COURSES: instructor `courses/[courseId]/actions.ts` (module/lesson/resource/quiz/assignment CRUD + publishCourse)
ENROLLMENT: `src/services/enrollmentService.ts` (real); public `enrollment-actions.ts` (STUB)
CLASSROOM: `src/app/classroom/actions.ts`
ADMIN: `(admin)/courses/actions.ts` currently only `getAdminCourseData` (STUB relative to historical assignInstructor/createCourse)
PAYMENT: webhook route + razorpay.service
CERTIFICATES: public verify/certificate pages

Pattern: CLIENT -> SERVER ACTION / ROUTE HANDLER -> AUTHORIZATION -> BUSINESS LOGIC -> PRISMA -> DATABASE.

---

## 15. DATA OWNERSHIP

| Entity | Read | Create | Update | Delete |
|---|---|---|---|---|
| User | self / admin | register | self limited / admin | not implemented |
| Course | public if PUBLISHED; editors if assigned | admin historically | assigned instructor / admin | not generally exposed |
| CourseInstructor | editors / admin | admin historically | n/a | n/a |
| Enrollment | owner / admin | free enroll service / paid webhook | status updates | not exposed |
| Lesson / Module / Resource / Quiz / Assignment | editors; classroom if enrolled | assigned instructor / admin | assigned instructor / admin | assigned instructor / admin |
| LessonProgress / Note / QuizAttempt / AssignmentSubmission | owner | enrolled user via classroom actions | owner | not exposed |
| Order / Payment | owner / admin | payment flow | webhook | not exposed |
| Certificate | owner / public verify | issuance logic if present | n/a | n/a |
| WebhookEvent | system | webhook | webhook | n/a |

---

## 16. SERVER / CLIENT COMPONENT RULES

Default: Server Component.

Client only for browser interaction, form state, animation, client-only APIs, interactive controls.

Do not move authorization into client components. Current layouts use client session for chrome only; that is display, not permission.

---

## 17. UI / DESIGN SYSTEM

Approved tokens from `globals.css`:

- Background `#EBF5FF`
- Surface `#FFFFFF`
- Primary `#0069E0`
- Navy `#181D27`
- Text `#111111`
- Muted `#4A5565`
- Soft blue `#CCE1F9`
- Border `#E5E7EB`

Principles: Anthropic frontend-design, UI/UX Pro Max, restrained motion. This phase does not implement visual changes.

---

## 18. MOTION SYSTEM

CURRENTLY IMPLEMENTED: framer-motion is a dependency; no dedicated GSAP system; no large animation pass.

PLANNED: public-site motion, workspace motion, classroom motion, admin motion, reduced-motion support, GSAP usage boundaries in a later dedicated motion phase.

---

## 19. DATA HONESTY

No UI may fabricate backend data. Stubs must use empty / coming soon / not implemented states. Do not fake enrollments, quiz attempts, assignments, certificates, notes, analytics, payments, or orders.

---

## 20. ERROR HANDLING

- Not authenticated: redirect `/login` or throw Unauthorized
- Unauthorized role: `notFound()` via authorizeRole, or throw Forbidden
- Not found: `notFound()`
- Validation: thrown Error from server actions (example: publishCourse title/description)
- Empty: honest empty copy
- Loading: Skeleton primitive exists

---

## 21. SEO

Public pages indexable where listed in `robots.ts` allow: `/`, `/courses`, `/about`, `/community`, `/faq`, `/verify`.

Disallow: `/dashboard`, `/admin`, `/instructor`, `/classroom`, `/api/`, `/login`, `/register`, `/certificate`, `/contact`.

Sitemap includes static public routes plus PUBLISHED courses by id. Canonical/metadata exist on several public pages. Private workspace pages set `robots: { index: false, follow: false }` where implemented.

---

## 22. DEPLOYMENT

GitHub -> Vercel -> Next.js build (`prisma generate && next build`) -> Neon PostgreSQL.

Environment variable categories (values never documented here):

- Database: DATABASE_URL, DIRECT_URL
- Auth: AUTH_SECRET, optional NEXTAUTH_SECRET, NEXTAUTH_URL
- Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (conditionally loaded; app boots without them)
- Payments: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
- Local demo only: DEMO_STUDENT_PASSWORD, DEMO_INSTRUCTOR_PASSWORD, DEMO_ADMIN_PASSWORD

Never commit `.env` or secrets.

---

## 23. CURRENT GAPS

Proven by inspection:

- Student hub pages beyond `/dashboard` are stubs and lack page-level `authorizeRole`.
- Instructor nested lesson/resource/quiz pages may still resolve under `/courses/...` rather than `/instructor/courses/...`.
- Admin nested course manage page currently lives at `(admin)/courses/[courseId]` which resolves to `/courses/[courseId]`, colliding conceptually with public course detail.
- Historical admin createCourse/assignInstructor actions were replaced by a stub `getAdminCourseData` in the group copy.
- Public enrollment/payment server actions are stubs; real enrollment service is unused by the public group EnrollButton.
- TARGET `/about/team` missing; `/about-us` exists instead.
- TARGET `/learn/...` classroom URLs missing; CURRENT `/classroom/...`.
- Workspace layouts are client components using useSession; they cannot currently be server authorization boundaries without conversion.
- Persistent notes/quizzes/assignments/certificates hub UIs are not wired to existing classroom/backend data.
- Email not implemented.
- Community persistence is demo/static on public page; admin community is stub.
- Production Vercel env and production-domain auth are outside this document and remain a separate verification concern.

---

## 24. FUTURE DEVELOPMENT RULE

Every future feature must answer:

1. Which layer does it belong to?
2. Which route owns it?
3. Which role can access it?
4. Which database entities does it touch?
5. Which server action/API handles it?
6. What authorization protects it?
7. How is it tested?
8. What existing functionality could it regress?

---

## 25. ARCHITECTURE INVARIANTS

1. No duplicate resolved routes.
2. Server-side authorization is authoritative.
3. Enrollment controls classroom access.
4. Free and paid courses both create enrollment before classroom access.
5. Instructor course scope is enforced via CourseInstructor.
6. Admin operations remain admin-only.
7. No client-controlled role authorization.
8. No secrets in source control.
9. No destructive production DB changes.
10. No fake backend data.
11. Preserve existing business logic before adding UI.
12. Build/lint/typecheck/tests must pass before merge.

---

End of canonical architecture freeze.