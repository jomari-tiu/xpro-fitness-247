# Graph Report - xpro-fitness-247  (2026-10-15)

## Corpus Check
- 130 files · ~32,789 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 2, .ico 1, .css 1)

## Summary
- 727 nodes · 2508 edges · 37 communities (26 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- useDb
- admin/payments/view.tsx
- format.ts
- shared.tsx
- next
- db.ts
- members/[id]/view.tsx
- progress-panel.tsx
- components.json
- package.json
- dependencies
- login-form.tsx
- compilerOptions
- trainer/plans/view.tsx
- devDependencies
- Agent team protocol
- scripts
- AppShell
- nav.ts
- extract-legacy-assets.mjs
- backend-dev.md
- frontend-dev.md
- qa.md
- eslint.config.mjs
- README.md
- useSession
- quality-gate.mjs
- @playwright/test
- utils.ts
- vitest
- admin/payments/page.tsx
- admin/plans/page.tsx
- bookings/page.tsx
- schedule/page.tsx
- AGENTS.md
- .claude/CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `useDb` - 95 edges
2. `fullName()` - 57 edges
3. `PageHeader()` - 53 edges
4. `useNow()` - 45 edges
5. `formatDate()` - 40 edges
6. `lucide-react` - 35 edges
7. `next` - 35 edges
8. `react` - 34 edges
9. `PersonAvatar()` - 27 edges
10. `membershipStatus()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `How you work` --references--> `useNow()`  [INFERRED]
  .claude/agents/frontend-dev.md → src/hooks/use-now.ts
- `AlertsPage()` --calls--> `EmptyState()`  [EXTRACTED]
  src/app/admin/alerts/view.tsx → src/components/shared.tsx
- `AnnouncementsPage()` --calls--> `PageHeader()`  [EXTRACTED]
  src/app/admin/announcements/view.tsx → src/components/shared.tsx
- `AnnouncementsPage()` --calls--> `formatDateTime()`  [EXTRACTED]
  src/app/admin/announcements/view.tsx → src/lib/format.ts
- `AnnouncementsPage()` --calls--> `useDb`  [EXTRACTED]
  src/app/admin/announcements/view.tsx → src/lib/store/db.ts

## Import Cycles
- None detected.

## Communities (37 total, 11 thin omitted)

### Community 0 - "useDb"
Cohesion: 0.08
Nodes (64): lucide-react, instant, AlertsPage(), instant, AttendancePage(), columns, MemberDetailPage(), MembersPage() (+56 more)

### Community 1 - "admin/payments/view.tsx"
Cohesion: 0.09
Nodes (34): @hookform/resolvers, react, react-hook-form, sonner, AnnouncementDialog(), AnnouncementForm(), audienceLabel, columns (+26 more)

### Community 2 - "format.ts"
Cohesion: 0.07
Nodes (47): @tanstack/react-table, Row, instant, columns, Row, Row, Row, instant (+39 more)

### Community 3 - "shared.tsx"
Cohesion: 0.05
Nodes (25): instant, EditMemberPage(), instant, NewMemberPage(), instant, PaymentReceiptPage(), instant, EditTrainerPage() (+17 more)

### Community 4 - "next"
Cohesion: 0.08
Nodes (32): nextConfig, next, archivo, jetbrainsMono, metadata, HomePage(), LandingEffects(), Gallery() (+24 more)

### Community 5 - "db.ts"
Cohesion: 0.07
Nodes (37): announcementSchema, AnnouncementValues, assignClientsSchema, AssignClientsValues, availabilitySchema, AvailabilityValues, bookingSchema, BookingValues (+29 more)

### Community 6 - "members/[id]/view.tsx"
Cohesion: 0.09
Nodes (6): instant, instant, SettingsPage(), instant, DataTableProps, useCurrentUser()

### Community 7 - "progress-panel.tsx"
Cohesion: 0.09
Nodes (16): recharts, instant, checkInConfig, revenueConfig, instant, PortalProgressPage(), delta(), LogProgressDialog() (+8 more)

### Community 9 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "package.json"
Cohesion: 0.09
Nodes (21): name, packageManager, private, version, class-variance-authority, cmdk, date-fns, next-themes (+13 more)

### Community 11 - "dependencies"
Cohesion: 0.09
Nodes (22): dependencies, class-variance-authority, clsx, cmdk, date-fns, @hookform/resolvers, lucide-react, next (+14 more)

### Community 12 - "login-form.tsx"
Cohesion: 0.15
Nodes (15): Form(), LoginForm(), LoginPage(), metadata, DbGate(), noopSubscribe(), useMounted(), authenticate() (+7 more)

### Community 13 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 14 - "trainer/plans/view.tsx"
Cohesion: 0.18
Nodes (9): instant, AnnouncementsPage(), instant, PortalWorkoutsPage(), instant, TrainerPlansPage(), EmptyState(), WorkoutPlanCard() (+1 more)

### Community 15 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, @playwright/test, tailwindcss, @tailwindcss/turbopack, @types/node, @types/react (+3 more)

### Community 16 - "Agent team protocol"
Cohesion: 0.20
Nodes (9): Agent team protocol, Commands, Current architecture, File ownership (edit only what you own), graphify, Message templates (use them verbatim as the first line), Team rules, Workflow per module (+1 more)

### Community 17 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, check, dev, lint, start, test, test:e2e (+2 more)

### Community 18 - "AppShell"
Cohesion: 0.33
Nodes (6): Layout(), Layout(), Layout(), AppShell(), Guarded(), PageSkeleton()

### Community 19 - "nav.ts"
Cohesion: 0.29
Nodes (7): Area, AREA_ROLES, AREA_TITLE, NAV, NavGroup, NavItem, Role

### Community 20 - "extract-legacy-assets.mjs"
Cohesion: 0.33
Nodes (4): lines, manifest, names, outDir

### Community 21 - "backend-dev.md"
Cohesion: 0.50
Nodes (3): How you work, Rules, You own (only edit these)

### Community 22 - "frontend-dev.md"
Cohesion: 0.50
Nodes (3): How you work, Rules, You own (only edit these)

### Community 23 - "qa.md"
Cohesion: 0.50
Nodes (3): How you work, Rules, You own (only edit these)

### Community 24 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 25 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 26 - "useSession"
Cohesion: 0.67
Nodes (4): AppSidebar(), NavLink(), useBadgeCount(), useSession

## Knowledge Gaps
- **14 isolated node(s):** `class-variance-authority`, `cmdk`, `next-themes`, `radix-ui`, `react-day-picker` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 281 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `useDb`, `admin/payments/view.tsx`, `format.ts`, `shared.tsx`, `members/[id]/view.tsx`, `progress-panel.tsx`, `app-shell.tsx`, `package.json`, `login-form.tsx`, `trainer/plans/view.tsx`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `useNow()` (e.g. with `How you work` and `getServerSnapshot()`) actually correct?**
  _`useNow()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `class-variance-authority`, `cmdk`, `next-themes` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useDb` be split into smaller, more focused modules?**
  _Cohesion score 0.08242908814011041 - nodes in this community are weakly interconnected._
- **Why does `useDb` connect `useDb` to `admin/payments/view.tsx`, `format.ts`, `shared.tsx`, `db.ts`, `members/[id]/view.tsx`, `progress-panel.tsx`, `app-shell.tsx`, `login-form.tsx`, `trainer/plans/view.tsx`, `AppShell`, `useSession`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `admin/payments/view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09138995004407875 - nodes in this community are weakly interconnected._
- **Why does `react` connect `admin/payments/view.tsx` to `useDb`, `format.ts`, `next`, `members/[id]/view.tsx`, `progress-panel.tsx`, `app-shell.tsx`, `package.json`, `login-form.tsx`, `trainer/plans/view.tsx`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._