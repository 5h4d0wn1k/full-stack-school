# Release Readiness Report

## Snapshot

- Date: 2026-05-14
- Branch: `harden/release-readiness-baseline`
- Default branch: `main`
- App: Next.js school management dashboard with Clerk, Prisma, and PostgreSQL
- Delivery target: PR-first hardening, no production deploy from this node

## Safe Hardening Changes

- Added a GitHub Actions CI workflow for deterministic install, Docker build, Prisma migration deploy, verification, and health smoke.
- Added `verification_contract.json` as the repo-local verification source of truth.
- Added `.jarvis/production_grade_profile.json` to make release, verification, deploy, and rollback expectations explicit, with canonical numeric `schema_version: 1`.
- Added repo-local AI operating guidance through `AGENTS.md` and `.codex` config, rules, and preflight hook.
- Added product PRFAQ and critical user journey templates for future major work.
- Added dependency-light `/health` endpoint, smoke script, release-contract tests, and product behavior regression tests.
- Marked the authenticated dashboard layout as dynamic so build verification no longer relies on live database reads during dashboard page prerendering.
- Fixed the local Compose service-name mismatch from `postgress` to `postgres` and aligned the app `DATABASE_URL` with the service name.
- Moved production migration execution out of the Docker image build path; Compose now runs `prisma migrate deploy` as a health-gated one-shot service.
- Remediated the earlier critical production audit gate by updating the existing dependency baseline to `next@14.2.35`, `eslint-config-next@14.2.35`, and `@clerk/nextjs@^5.7.6`.
- Synchronized `package-lock.json` with the current `package.json` dependency baseline so `npm ci` and Docker `npm ci` can run cleanly.
- Added `npm run audit:critical` to package scripts, CI, and repo guidance so critical production advisories block release promotion.
- Added `.dockerignore` to keep generated artifacts, local evidence, governance docs, and secrets out of the runtime image context.

## Delivery Blockers

- No lockfile/install or Docker build blocker remains for this scoped node after the retry verification.
- The branch `harden/release-readiness-baseline` does not track an upstream remote yet, so PR publication still requires push/PR handoff.
- A real `cynik` shadow deploy and credentialed smoke are blocked by missing deployment credentials and target metadata in this workspace.
- Production secrets and service manager controls are not available in this workspace.
- Product behavior regression tests and release-contract tests are green, but no browser end-to-end suite exists for authenticated dashboard flows.
- `npm audit --omit=dev --audit-level=critical` passes, but `npm audit --omit=dev` still reports 5 high and 3 moderate production vulnerabilities. The remaining framework/auth fixes require separate behavior-tested major-upgrade work.
- Local shell verification ran on Node `v18.19.1`; CI and Docker verification are contracted for Node 20. `npm ci` emits an `EBADENGINE` warning for `eslint-visitor-keys@5.0.1`, which requires newer Node 20.x.

## Verification Evidence

- `package.json` and `package-lock.json` now agree on the dependency baseline for `@clerk/nextjs@^5.7.6`, `next@14.2.35`, and `eslint-config-next@14.2.35`.
- JavaScript syntax checks passed for `scripts/prisma-validate.mjs`, `scripts/smoke-health.mjs`, `tests/contracts.test.mjs`, and `tests/product-behavior.test.mjs`.
- JSON parsing passed for `verification_contract.json`, `.jarvis/production_grade_profile.json`, and `.codex/config/repo.json`.
- `git diff --check` passed.
- Python syntax gate is not applicable: no Python files were found outside ignored/generated directories.
- Secret pattern scan found no `sk_live`, `pk_live`, private-key, or credentialed PostgreSQL production URL patterns outside ignored/generated directories.
- `npm ci` passed. Local shell was Node `v18.19.1` with npm `9.2.0`; npm emitted an `EBADENGINE` warning for `eslint-visitor-keys@5.0.1` requiring newer Node 20.x. CI and Docker verification are contracted for Node 20.
- `npm run audit:critical` passed with 0 critical production vulnerabilities.
- `npm audit --omit=dev --json` returned 8 production vulnerabilities: 5 high and 3 moderate.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ CLERK_SECRET_KEY=sk_test_placeholder npm run verify` passed: Prisma generate, Prisma validate, 13 of 13 `node --test` tests, Next lint, TypeScript typecheck, and `next build`.
- `npm audit --omit=dev --audit-level=critical` exited 0. The remaining production audit summary is 8 vulnerabilities: 5 high and 3 moderate.
- `docker compose config --quiet` passed. `docker compose config` shows the app depends on healthy `postgres` plus successful one-shot `migrate`.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:<dynamic-port>/full_stack_school?schema=public npx prisma migrate deploy` passed against a disposable `postgres:15` container and applied both existing migrations.
- `docker build --no-cache --target deps -t full-stack-school:deps-check .` passed, proving Docker `npm ci` works from the synchronized lockfile. Build context was `689.2kB`.
- `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ -t full-stack-school:release-path .` passed and produced the local release-path image. Build context was `689.2kB`; the build emitted a non-blocking `caniuse-lite` outdated warning.
- `PORT=3100 ... npm run start` plus `HEALTH_URL=http://127.0.0.1:3100/health npm run smoke:health` passed against the local production build.
- Release bundle creation passed: `.codex/release/full-stack-school-release-readiness-baseline-2026-05-14.tar.gz` was created and `tar -tzf` listed the expected release-readiness files.

## Deploy Evidence

- No production deploy was attempted.
- Local Docker shadow start succeeded with `full-stack-school:release-path` using placeholder Clerk values and a Docker-assigned localhost port.
- `HEALTH_URL=http://127.0.0.1:32776/health npm run smoke:health` passed against the built image.
- A first restart-smoke attempt failed because the harness kept probing stale port `32774` after Docker remapped the restarted container to `32775`; container logs showed the app was running.
- Corrected restart validation passed after re-reading Docker's dynamic host port: initial smoke passed at `127.0.0.1:32776`, `docker restart` succeeded, Docker remapped the service to `127.0.0.1:32777`, and `HEALTH_URL=http://127.0.0.1:32777/health npm run smoke:health` passed.
- Disposable Postgres and smoke containers were removed after verification.
- Real `cynik` shadow deploy and credentialed smoke remain blocked by missing deployment credentials and target metadata.

## Rollback Note

This hardening is rollbackable by reverting the pull request or redeploying the previous release artifact. Runtime rollback remains `previous_release` per `verification_contract.json` and `.jarvis/production_grade_profile.json`. The lockfile sync is rollbackable by reverting `package-lock.json` together with the existing dependency-baseline change in `package.json`. No Prisma migration, production deploy, or data change is included in this node.
