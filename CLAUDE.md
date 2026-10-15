@AGENTS.md

# XPRO Fitness 24/7

Marketing site + Gym Management (`/admin`), Trainer Hub (`/trainer`) and Member Portal (`/portal`).
Next.js 16 (App Router, Cache Components), React 19, Tailwind v4, shadcn/ui (Radix), react-hook-form + zod, Zustand, pnpm.

## Commands
- `pnpm dev`: dev server on **http://localhost:3247** (Next allows only one dev server per project)
- `pnpm check`: lint + typecheck + unit tests (the same gate the TaskCompleted hook runs)
- `pnpm test` / `pnpm test:e2e`: Vitest unit tests / Playwright e2e (reuses the dev server)
- `pnpm build`: production build

## Current architecture
- **No backend yet.** All data lives in a persisted Zustand store (`src/lib/store/db.ts`, localStorage key `xpro-db-v1`) seeded by `src/lib/mock/seed.ts`. The store's action names are the integration seam: the backend replaces them one module at a time.
- Mock auth: `src/lib/auth.ts` + `useSession`; role guard in `src/components/app-shell/app-shell.tsx`.
- Area pages: server `page.tsx` (`export const instant = false`) → client `view.tsx`.
- Domain types: `src/lib/types.ts`. Form schemas: `src/lib/schemas.ts`.
- Original static design export: `_legacy/index.html` (reference only).
- Backend stack: **not decided yet.** Default assumption is Next.js route handlers in `src/app/api/**` with services in `src/server/**`. Confirm with the user before adding a database.

---

# Agent team protocol

Team: **`backend-dev`**, **`frontend-dev`**, **`qa`**, plus the **lead** (the main session). Role definitions live in `.claude/agents/`.

## File ownership (edit only what you own)
| Area | Owner |
|---|---|
| `src/app/api/**`, `src/server/**`, `src/contracts/**`, DB schema/migrations | backend-dev |
| `src/app/**` (except `api`), `src/components/**`, `src/hooks/**`, `src/lib/**` (except contracts), `globals.css` | frontend-dev |
| `e2e/**`, `docs/qa/**`, extra `*.test.ts` that QA adds | qa |
| `CLAUDE.md`, `.claude/**`, `package.json` deps, configs | lead (ask before changing) |

If you need a change in a file you don't own, **message the owner**. Never edit it yourself.

## Workflow per module
1. **Lead** creates tasks: `API` (backend-dev) → `UI integration` (frontend-dev, blocked by API) → `QA` (qa, blocked by UI integration).
2. **backend-dev** builds the contract and endpoints, runs `pnpm check`, sends **API_READY** to `frontend-dev`, and completes the task.
3. **frontend-dev** integrates against the contract, runs `pnpm check`, clicks through the flow, sends **FEATURE_READY** to `qa`, and completes the task.
4. **qa** tests. Each failure becomes a **BUG** sent to the owner. The owner fixes it and replies **FIXED**. QA re-tests the case and then the full module suite. Repeat until clean.
5. **qa** sends **QA_PASSED** to the lead and both devs. The **lead** reviews the diff and commits.

A task cannot be marked complete while `pnpm check` fails. The `TaskCompleted` hook enforces this.

## Message templates (use them verbatim as the first line)
```
API_READY: <module>
Endpoints: METHOD /api/... (one per line)
Contract: src/contracts/<module>.ts  (request/response schema names)
Auth: <which roles>   Errors: <codes and when>
How to try: <curl or test name>   Notes: <limits, TODOs>
```
```
FEATURE_READY: <module/feature>
Routes: /admin/...   Roles to test: admin, staff, ...
What changed: <bullets>   Known gaps: <none | list>
```
```
BUG: <ID> <short title>   Severity: blocker | major | minor
Owner: backend-dev | frontend-dev
Steps: 1… 2… 3…
Expected: …   Actual: …
Evidence: <failing test / route / response body / file:line>
```
```
FIXED: <ID>   Cause: <one line>   Fix: <files>   Test added: <name>
```
```
CONTRACT_CHANGE: <module>   What: <field/endpoint>   Why: …   Breaking: yes/no
```
```
QA_PASSED: <module>   Cases: <n passed>   Bugs closed: <IDs>   Suites: <files>
```

## Team rules
- Keep messages short and actionable. One BUG per message.
- Don't start a blocked task. Wait for the hand-off message.
- Don't `git commit` unless you are the lead.
- Read the relevant guide in `node_modules/next/dist/docs/` before using a Next.js API you haven't used in this repo.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
