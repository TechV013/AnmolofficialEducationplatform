=== FRONTEND RESTRUCTURE ARCHITECTURE ===
Author: System
Date: 2026-01-11

=== CURRENT STATE SUMMARY ===
- Root layout: src/app/layout.tsx (Plus Jakarta Sans, SessionProvider)
- Auth: NextAuth v4 + CredentialsProvider + JWT strategy + authConfig with process.env.AUTH_SECRET
- Routes: Flat (public/auth/student/instructor/admin mixed)
- Design: Blue/white (#EBF5FF, #0069E0, #181D27, #111111, #4A5565, #CCE1F9, #E5E7EB)
- Components: Navbar, Footer, CourseCard, Sidebar, ModuleForm, LessonEdit/CreateForm, ClassroomClient
- Server actions: instructor/courses/[courseId]/actions (module/lesson/quiz CRUD, publish)
- Admin actions: admin/courses/actions (create, assignInstructor)
- Services: courses.service (getPublished, getById), enrollmentService, dashboard.service, progressService
- Middleware: rate limiter + security headers (non-production HSTS)
- RBAC: server-side (authorizeRole, requireCourseEditor, requireRole)
- Auth chain: Browser → login → CredentialsProvider.authorize → JWT → session callback → getServerSession → getCurrentUser → authorizeRole/requireRole

=== APPROVED DESIGN SYSTEM ===
Colors (existing in globals.css - preserved):
- Background: #EBF5FF
- Surface: #FFFFFF
- Primary: #0069E0
- Dark: #181D27
- Text: #111111
- Muted: #4A5565
- Soft Blue: #CCE1F9
- Border: #E5E7EB
- Light Gray: #EBF5FF

Typography: Plus Jakarta Sans (variable font, preserved)
No orange/green branding. No crypto/AI/generic SaaS styling.

=== ROUTE ARCHITECTURE (PRESERVED) ===
Public: /, /courses, /courses/[id], /about, /community, /contact (new), /faq (new)
Auth: /login, /register
Student workspace: /dashboard, /dashboard/* (courses, progress, notes, certificates, assignments, quizzes, profile)
Instructor workspace: /instructor, /instructor/courses/[id], /instructor/*
Admin workspace: /admin, /admin/*
Classroom: /classroom/[courseId]/[lessonId] (preserved with existing backend behavior)

=== LAYOUT ARCHITECTURE ===
- RootLayout (src/app/layout.tsx): SessionProvider + metadata + font
- PublicLayout (new): Navbar + Footer wrapper for public routes
- AuthLayout (new): Centered clean layout for login/register
- StudentLayout (new): Workspace sidebar/header for student routes
- InstructorLayout (new): Studio sidebar/header for instructor routes
- AdminLayout (new): Control center sidebar/header for admin routes

=== AUTHENTICATION ===
- Normal flow: email/password → server validates → JWT session → redirect to role workspace
- Demo buttons remain ONLY as dev/QA convenience: clearly labeled, prefill email only, no password exposure, server-side role, no client-side bypass
- Role NEVER selected by user; always from server session (token.role from JWT)
- Redirect after login: ADMIN → /admin, INSTRUCTOR → /instructor, STUDENT → /dashboard
- Unauthorized access: server-side notFound() or redirect (no client-only hiding)

=== COMPONENT SYSTEM ===
Shared primitives (new):
- Button, Input, Select, Card, Badge, Tabs, Modal/Dialog, Breadcrumb, Progress, Avatar, Table, EmptyState, Skeleton, Tooltip, Toast
Higher-level components (new/restructured):
- WorkspaceSidebar (student/instructor/admin variants)
- WorkspaceHeader
- CourseCard (enhanced)
- LessonList, ModuleList, ResourceList
- QuizCard, AssignmentCard, CertificateCard
- ActivityItem, StatBlock, DataTable, PublishStatus
- StudentNav, InstructorNav, AdminNav

=== MOTION SYSTEM ===
GSAP used selectively:
1. Page entrance: subtle opacity/translate (public hero, workspace pages)
2. Section reveal: ScrollTrigger for public marketing sections only
3. Course card hover: small lift/shadow transition (CSS, not GSAP)
4. Public hero: one polished GSAP sequence (hero section only)
5. Dashboard/Instructor/Admin: very restrained entrance motion
6. Classroom: minimal motion
7. Clean up all animations on unmount; respect prefers-reduced-motion; avoid continuous animations

=== RESPONSIVE ===
- Mobile-first design (existing Tailwind v4 with responsive prefixes)
- Student sidebar → mobile bottom/top navigation
- Instructor/Studio: collapsible panels on tablet
- Admin: responsive tables with controlled horizontal scroll
- Classroom: mobile-first reading/video experience
- Breakpoints: mobile (<768), tablet (768-1024), desktop (>1024), large (>1280)

=== ACCESSIBILITY ===
- Semantic HTML preserved
- Keyboard navigation preserved
- Visible focus states in design system
- Proper heading hierarchy
- ARIA labels where needed
- Reduced motion support via prefers-reduced-motion
- Touch targets minimum 44px
- Color contrast meets WCAG AA

=== PERFORMANCE ===
- No unnecessary "use client" additions
- Server components preserved for data-heavy pages
- Client components only for interactive elements
- Stable data fetching (existing services preserved)
- Optimized images preserved
- No duplicate API calls

=== MIGRATION SAFETY ===
All existing server actions preserved. All existing routes preserved (only enhanced/restructured). No Prisma changes. No auth changes. RBAC intact.
