---
name: project-evaltrack
description: EvalTrack project status — Next.js teaching evaluation system
metadata:
  type: project
---

EvalTrack is a teaching effectiveness evaluation system built with Next.js 15, Prisma, NextAuth v5, PostgreSQL.

**Why:** Single-institution web app for students to evaluate lecturers; results flow to HOD → QA Officer → Admin.

**Current status (June 2026):** Build passes. All 7 sprints of features implemented across 87+ source files.

**Key architectural facts:**
- Path alias: `@/*` → project root, so all internal imports use `@/src/...`
- Dashboard layout is a client component with `SessionProvider` wrapper + `dynamic = "force-dynamic"`
- Auth: NextAuth v5 JWT strategy, `auth()` in server components, `useSession` in client
- No `.env.local` DATABASE_URL filled in yet — user must add their Neon connection string

**How to apply:** When working in this codebase, always use `@/src/...` import paths. Run `npm run db:push` then `npm run db:seed` after adding DATABASE_URL.
