# PRFAQ: School Management Dashboard

## Problem Framing

Schools need a single operational dashboard where administrators, teachers, students, and parents can see the records and schedule information relevant to their role. The current codebase already models those roles, but major future work should start by naming the user, journey, metric, and release risk before implementation.

## Internal Press Release Template

**Headline:** `[User role] can now [complete important school workflow] without [current pain].`

**Customer:** `[administrator | teacher | student | parent]`

**Problem:** `[What job is hard, slow, duplicated, or error-prone today?]`

**Solution:** `[What workflow will the dashboard make simpler or safer?]`

**Business or operational outcome:** `[Examples: fewer manual updates, faster class setup, fewer support requests, better parent visibility.]`

**Launch evidence:** `[Metric, qualitative feedback, or operational signal that proves the change worked.]`

## FAQ Template

**Who is the first user this serves?**
`TBD`

**What critical user journey must work before release?**
`TBD`

**What data must be correct?**
`TBD`

**What permissions or role checks are involved?**
`TBD`

**What is explicitly out of scope for v1?**
`TBD`

**What would cause rollback or release abort?**
`TBD`

## v1 Scope Checklist

- Target one primary role and one measurable workflow.
- Identify the Prisma models and routes touched by the change.
- Define the expected empty, loading, error, and unauthorized states.
- Add or update verification checks before merging.
- Document rollout and rollback notes in the pull request.
