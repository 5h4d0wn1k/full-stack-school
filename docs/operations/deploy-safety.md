# Deploy Safety And Rollback

## Current Risk Classification

This hardening pass is config, documentation, CI, and one additive health route. It should not change existing dashboard behavior.

Container deployment is guarded but still needs release-owner signoff:

- Critical production dependency audit is now a release gate through `npm run audit:critical`; remaining non-critical advisories need a separate behavior-tested dependency PR before high-confidence production promotion.
- The container image build is now database-side-effect-free: it installs dependencies, generates Prisma Client, builds Next.js, and starts with `npm start`.
- `.dockerignore` keeps generated local artifacts, secrets, and repo governance evidence out of the Docker build context.
- Prisma schema changes must be applied with `npx prisma migrate deploy` as an explicit deploy step before routing production traffic to the new app container.
- `DATABASE_URL` in `docker-compose.yml` is local-compose-only; production secrets must come from the service manager or deployment platform, not git.

This follows Prisma's production guidance: `migrate dev` is development-only, while production and test environments use `migrate deploy`. See [Prisma Migrate: development and production](https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production).

## Environment Source

The deploy contract and workspace config define `env_file_source` as process environment supplied by the deployment platform. Do not use committed `.env` files for release, CI, shadow deploy, or production credentials.

## Rollout Strategy

Use branch -> pull request -> CI -> reviewed merge. For production, deploy only after a release owner confirms secrets, database target, migration plan, and rollback artifact.

The release sequence is:

1. Build the image from `Dockerfile`. Image build must not connect to or mutate the database.
2. Run `npx prisma migrate deploy` once against the target database from CI/CD or a controlled release job.
3. Start or roll the app container with the same image after migrations succeed.
4. Smoke `/health`, then verify the highest-risk authenticated dashboard path available in that environment.

For the local Compose harness, `docker compose up --build` starts PostgreSQL, waits for its healthcheck, runs the one-shot `migrate` service, and starts `app` only after the migration container exits successfully. This uses Docker Compose dependency conditions documented in [Control startup and shutdown order in Compose](https://docs.docker.com/compose/how-tos/startup-order/).

## Abort Criteria

- CI fails lint, typecheck, Prisma generation, build, or health smoke.
- `/health` does not return HTTP 200 with `status: ok`.
- `npx prisma migrate deploy` fails, times out on advisory lock, or reports modified migration history.
- Prisma migrations are not backward compatible or lack a restore plan.
- Role-based access changes cannot be verified for admin, teacher, student, and parent paths.

## Rollback

- Primary rollback: revert the pull request.
- Runtime rollback: redeploy the previous known-good artifact.
- Database rollback: avoid destructive migrations; use backward-compatible expand/contract changes until tested restore procedures exist. If a migration has already committed, prefer rolling the app back to a version compatible with the new schema rather than attempting an untested down migration.

## Owner Checklist

- Confirm production environment variables outside git.
- Confirm whether Docker Compose is only a local harness or an approved deployment interface.
- Confirm service manager or hosting platform restart procedure.
- Confirm who runs `npx prisma migrate deploy` and where its logs are retained.
- Confirm previous release artifact or commit SHA before deployment.
- Capture post-deploy smoke evidence for `/health` and the highest-risk authenticated journey.
