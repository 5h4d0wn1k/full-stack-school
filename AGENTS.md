# AGENTS.md

## Mission

This repository is a Next.js school management dashboard using Clerk, Prisma, and PostgreSQL. Preserve current product behavior while improving release readiness through small, reviewable, evidence-backed changes.

## Working Rules

- Use a branch and pull request for normal code, config, workflow, and documentation changes.
- Keep diffs scoped. Do not rewrite product flows, auth, Prisma models, or deploy files unless the task explicitly asks for that surface.
- Inspect the current code before changing behavior.
- Do not commit secrets, `.env` files, database dumps, or real student/family data.
- Treat Prisma migrations, Docker changes, auth changes, and middleware changes as release-risky.

## Verification Contract

Follow `verification_contract.json`.

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

## Known Release Blockers

- No browser end-to-end suite exists for authenticated dashboard flows.
- `npm run audit:critical` is required before release promotion; remaining non-critical production dependency advisories are tracked in `.codex/reports/release-readiness.md`.
- Dockerfile and Compose changes are release-risky and require build, migration, health-smoke, restart, and rollback evidence before production use.
- Production secrets, target metadata, deployment credentials, and the service manager are not available in this workspace.
