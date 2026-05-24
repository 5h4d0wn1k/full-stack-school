# AGENTS.md

## Mission

This repository is a Next.js school management dashboard using Clerk, Prisma, and PostgreSQL. Preserve current product behavior while improving release readiness through small, reviewable, evidence-backed changes.

## Working Rules

- Use a branch and pull request for normal code, config, workflow, and documentation changes.
- Keep diffs scoped. Do not rewrite product flows, auth, Prisma models, or deploy files unless the task explicitly asks for that surface.
- Inspect the current code before changing behavior.
- Do not commit secrets, `.env` files, database dumps, or real student/family data.
- Treat Prisma migrations, Docker changes, auth changes, and middleware changes as release-risky.

## Planning Guardrails

- Use `.jarvis/production_grade_profile.json` as the repo-local production-grade profile.
- For auth, Prisma, middleware, Docker, CI, or deploy changes, reference the `architecture` section in `.jarvis/production_grade_profile.json` and name the affected boundary.
- For reliability, healthcheck, restart, observability, or incident-response changes, reference the `reliability` section in `.jarvis/production_grade_profile.json`.
- For ownership, escalation, handoff, or runbook changes, reference the `ownership` section in `.jarvis/production_grade_profile.json`.
- For recurring blockers, quality ratchets, scorecards, or retro follow-up, reference the `continuous_improvement` section in `.jarvis/production_grade_profile.json`.
- Before major product or workflow work, update or reference `docs/product/prfaq.md` and `docs/product/critical-user-journeys.md`.
- Apply the agile Definition of Ready and Definition of Done in `.jarvis/production_grade_profile.json` and `agile_work_item.json` before starting broad implementation.
- Product-facing pull requests should name the target role, critical user journey, success metric, verification evidence, and rollback or abort condition.

## Verification Contract

Follow `verification_contract.json`.

Also check `agile_work_item.json` and the top-level `release`, `verification`, `reliability`, `ownership`, `continuous_improvement`, and `agile` sections in `.jarvis/production_grade_profile.json` when choosing release gates, `release.rollback_action`, health evidence, owners, ratchet evidence, Ready/Done evidence, or documenting blocked checks.

Minimum local checks for most changes:

```bash
npm ci
npm run prisma:generate
npm run prisma:validate
npm test
npm run lint
npm run typecheck
npm run build
```

Deploy-facing changes also require starting the built app and running:

```bash
npm run smoke:health
```

If a gate cannot run, document the blocker and residual risk in `.codex/reports/release-readiness.md`.

## Runtime Notes

- Healthcheck path: `/health`
- CI Node version: 20.x
- Package manager: npm with `package-lock.json`
- Database: PostgreSQL through Prisma
- Auth: Clerk
- Environment source: process environment supplied by the deployment platform; committed `.env` files are forbidden.

## Known Release Blockers

- No browser end-to-end suite exists for authenticated dashboard flows.
- `npm run audit:critical` is required before release promotion; remaining non-critical production dependency advisories are tracked in `.codex/reports/release-readiness.md`.
- Dockerfile and Compose changes are release-risky and require build, migration, health-smoke, restart, and rollback evidence before production use.
- Production secrets, target metadata, deployment credentials, and the service manager are not available in this workspace.
