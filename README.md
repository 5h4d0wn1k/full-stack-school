# Full-Stack School Management Dashboard

A production-style **school management dashboard** built as a full-stack learning
platform: Next.js 14 App Router, Clerk authentication, Prisma + PostgreSQL, and
role-based dashboards for admin, teacher, student, and parent. Covers the
complete stack — database schema, server actions, forms with validation,
charts, calendar, and Docker deployment.

## Features

- **Role-based dashboards** — separate views for `admin`, `teacher`, `student`,
  and `parent` under `src/app/(dashboard)/`, with Clerk session role checks in
  `src/middleware.ts` (`routeAccessMap` in `src/lib/settings.ts`).
- **Prisma + PostgreSQL data model** — 14 models (Admin, Student, Teacher,
  Parent, Grade, Class, Subject, Lesson, Exam, Assignment, Result, Attendance,
  Event, Announcement) with committed migrations in `prisma/migrations/`.
- **List management pages** — full CRUD-style list views for teachers, students,
  subjects, classes, lessons, exams, assignments, results, parents, events, and
  announcements under `src/app/(dashboard)/list/`.
- **Forms & validation** — `react-hook-form` plus zod schemas
  (`src/lib/formValidationSchemas.ts`) for teacher, student, class, exam, and
  subject records.
- **Analytics & visualization** — recharts charts (count, attendance, finance)
  on the admin dashboard.
- **Calendar & events** — `react-big-calendar` schedules and an event
  calendar/announcements feed.
- **Search, pagination, and modals** — table components with server-style search,
  pagination, and form modals.
- **Containerized deployment** — `Dockerfile` (Node 18, `next build`) and
  `docker-compose.yml` (PostgreSQL 15 + app on port 3000).

## Tech Stack

- **Next.js 14** (App Router, TypeScript) — `src/app` layout and routes
- **Clerk** — authentication and role-based middleware protection
- **Prisma** — ORM and migrations against PostgreSQL
- **Tailwind CSS** — utility-first styling
- **recharts, react-big-calendar, react-hook-form, zod**

## Quickstart

Prerequisites: Node.js 18+, a PostgreSQL database, and Clerk credentials.

```bash
npm install

# 1. Configure environment (.env.local)
#    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY +
#    DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

# 2. Apply the Prisma schema
npx prisma migrate dev

# 3. Run the dev server
npm run dev          # → http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up --build   # app + PostgreSQL 15, app on http://localhost:3000
```

## Project Structure

```
src/app/            Next.js routes (auth, (dashboard)/ list & role pages)
src/components/     forms, tables, charts, calendar, navigation
src/lib/            prisma client, data, settings (route access), actions
prisma/             schema.prisma + migrations + seed.ts
```

## Contributing

Community and learning contributions are welcome. Please follow the existing
components/patterns and run `npm run lint` before submitting a change.

## License

This repository does not currently include a LICENSE file.