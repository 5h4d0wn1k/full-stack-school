# Critical User Journeys

## Journey Inventory

1. Administrator manages the school structure: grades, classes, subjects, teachers, and students.
2. Teacher manages assigned lessons, exams, assignments, attendance, and results.
3. Student views personal schedule, assignments, exams, results, and attendance.
4. Parent views child-specific announcements, events, attendance, and results.

## Primary Journey Template

**Journey name:** `TBD`

**Primary user:** `TBD`

**Completion condition from the user's point of view:** `TBD`

**Entry point:** `TBD route or dashboard area`

**Steps:**

1. User signs in through Clerk.
2. Middleware and server components resolve role-specific access.
3. User navigates to the relevant dashboard or list page.
4. App reads or writes the needed Prisma records.
5. User sees confirmation, updated data, or a clear failure state.

## Failure-Sensitive Points

- Clerk role metadata is missing, stale, or mapped to the wrong route.
- Prisma query returns empty or inconsistent data for the current user.
- Mutations succeed in Clerk but fail in Prisma, or the reverse.
- Pagination, filtering, or relation queries hide expected records.
- Build-time or runtime environment variables are missing.

## Metrics And SLO Candidates

- Authenticated dashboard page availability: 99.5% monthly after production launch.
- `/health` response success: 99.9% for process-level checks.
- Critical page server response target: p95 under 1000 ms after warm start.
- Data correctness signal: zero known cross-role data visibility incidents.
- Support signal: track reports of missing assignments, results, events, and announcements.

## Rollout And Fallback

- Release one journey at a time behind a pull request with clear verification.
- Keep database migrations backward compatible.
- If role-specific data visibility is wrong, roll back the PR or disable the affected route until corrected.
