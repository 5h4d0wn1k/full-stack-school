# Release Readiness Report

## Snapshot

- Date: 2026-05-20
- Branch: `harden/release-readiness-baseline`
- Default branch: `main`
- App: Next.js school management dashboard with Clerk, Prisma, and PostgreSQL
- Delivery target: PR-first hardening, no production deploy from this node

## Safe Hardening Changes

- Added a GitHub Actions CI workflow for deterministic install, Docker build, Prisma migration deploy, verification, and health smoke.
- Added `verification_contract.json` as the repo-local verification source of truth.
- Added `.jarvis/production_grade_profile.json` to make release, verification, deploy, and rollback expectations explicit, with canonical numeric `schema_version: 1`.
- Added the required `architecture` section to `.jarvis/production_grade_profile.json`, including runtime topology, critical boundaries, release risk surfaces, and decision policy.
- Added the required `agile` section to `.jarvis/production_grade_profile.json`, including Definition of Ready, Definition of Done, release planning, metrics, and retro capture policy.
- Added repo-local AI operating guidance through `AGENTS.md` and `.codex` config, rules, and preflight hook.
- Tightened `AGENTS.md`, `.codex/config/repo.json`, `.codex/rules/release-readiness.md`, and contract tests so future AI sessions inherit product-planning and agile guardrails.
- Documented deployment environment-source metadata in `.codex/config/repo.json` so workspace config and deploy contract agree that secrets come from process environment or the deployment platform.
- Added product PRFAQ and critical user journey templates for future major work.
- Added dependency-light `/health` endpoint, smoke script, release-contract tests, and product behavior regression tests.
- Marked the authenticated dashboard layout as dynamic so build verification no longer relies on live database reads during dashboard page prerendering.
- Fixed the local Compose service-name mismatch from `postgress` to `postgres` and aligned the app `DATABASE_URL` with the service name.
- Moved production migration execution out of the Docker image build path; Compose now runs `prisma migrate deploy` as a health-gated one-shot service.
- Remediated the earlier critical production audit gate by updating the existing dependency baseline to `next@14.2.35`, `eslint-config-next@14.2.35`, and `@clerk/nextjs@^5.7.6`.
- Synchronized `package-lock.json` with the current `package.json` dependency baseline so `npm ci` and Docker `npm ci` can run cleanly.
- Added `npm run audit:critical` to package scripts, CI, and repo guidance so critical production advisories block release promotion.
- Added `.dockerignore` to keep generated artifacts, local evidence, governance docs, and secrets out of the runtime image context.
- Stopped ignoring `next-env.d.ts` and added a contract test so clean CI and Docker checkouts include the Next.js TypeScript environment shim instead of relying on a local generated file.

## Delivery Blockers

- No lockfile/install or Docker build blocker remains for this scoped node after the retry verification.
- No verification-contract file blocker remains: `verification_contract.json` exists, parses, and is covered by contract tests.
- No production-grade `architecture` section blocker remains: `.jarvis/production_grade_profile.json` includes the required architecture section and contract tests assert it.
- No production-grade `agile` section blocker remains: `.jarvis/production_grade_profile.json` includes the required agile planning section and contract tests assert it.
- The branch `harden/release-readiness-baseline` does not track an upstream remote yet. `git push -u origin harden/release-readiness-baseline` was rejected with HTTP 403 for the authenticated GitHub account, so PR publication requires a writable fork/remote or a maintainer push.
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
- `next-env.d.ts` is tracked for clean-checkout determinism because the Dockerfile and TypeScript toolchain expect the standard Next.js type shim.
- Python syntax gate is not applicable: no Python files were found outside ignored/generated directories.
- Secret pattern scan found no `sk_live`, `pk_live`, private-key, or credentialed PostgreSQL production URL patterns outside ignored/generated directories.
- `npm ci` passed. Local shell was Node `v18.19.1` with npm `9.2.0`; npm emitted an `EBADENGINE` warning for `eslint-visitor-keys@5.0.1` requiring newer Node 20.x. CI and Docker verification are contracted for Node 20.
- `npm run audit:critical` passed with 0 critical production vulnerabilities.
- `npm audit --omit=dev --json` returned 8 production vulnerabilities: 5 high and 3 moderate.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ CLERK_SECRET_KEY=sk_test_placeholder npm run verify` passed: Prisma generate, Prisma validate, 14 of 14 `node --test` tests, Next lint, TypeScript typecheck, and `next build`.
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

## Node 57dc0067 Revalidation

- `git status --porcelain=v1 -uall` was clean at node pickup; the dirty-tree snapshot was stale. The follow-up hardening tracks `next-env.d.ts` so clean checkouts do not depend on a local ignored Next.js type shim.
- `node --version && npm --version && npm ci` reported Node `v18.19.1` and npm `9.2.0`; `npm ci` passed with the expected local Node engine warning and reported 21 total audit findings. Node 20 remains the contracted CI and release runtime.
- `npm run audit:critical` exited 0; npm still reports 5 high and 3 moderate production advisories that require a separate behavior-tested dependency upgrade.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ CLERK_SECRET_KEY=sk_test_placeholder npm run verify` passed: Prisma generate, Prisma validate, 14 contract/product tests, Next lint, TypeScript typecheck, and `next build`.
- `PORT=3100 ... npm run start` plus `HEALTH_URL=http://127.0.0.1:3100/health npm run smoke:health` passed against a locally started production build.
- `docker compose config --quiet` passed.
- JSON parsing, `bash -n .codex/hooks/preflight.sh`, and `git diff --check` passed. Python syntax is not applicable because there are no tracked Python files.
- A live-secret scan found no live Clerk keys or private-key material outside ignored/generated directories. The broader scan matched only local placeholder PostgreSQL URLs in CI, Compose, scripts, and docs.
- `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ -t full-stack-school:release-node-57dc0067 .` passed with a `689.2kB` build context.
- Local Docker shadow smoke passed for image `full-stack-school:release-node-57dc0067`: `/health` passed before restart on `127.0.0.1:32782` and after `docker restart` on `127.0.0.1:32783`.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:32784/full_stack_school?schema=public npx prisma migrate deploy` passed against disposable `postgres:15` and applied both existing migrations.
- `git push -u origin harden/release-readiness-baseline` failed with HTTP 403: the authenticated GitHub account does not have write permission to `safak/full-stack-school`.
- Release bundle creation passed: `.codex/release/full-stack-school-release-readiness-baseline-2026-05-14.tar.gz` was regenerated from `HEAD` and confirmed to include `AGENTS.md`, `verification_contract.json`, `.jarvis/production_grade_profile.json`, `.codex/reports/release-readiness.md`, and `next-env.d.ts`.

## Node bceb23877923 Revalidation

- The mission-reported `verification_contract` blocker is resolved in the current tree: `verification_contract.json` is present, parseable, and referenced from `AGENTS.md` and `.codex/config/repo.json`.
- The mission-reported production-grade profile blockers are resolved by adding top-level `.jarvis/production_grade_profile.json` sections `architecture` and `agile`. The architecture section names runtime topology, auth/data/deployment/secrets boundaries, release-risk surfaces, and decision policy. The agile section names planning cadence, backlog policy, work item flow, Definition of Ready, Definition of Done, release planning, metrics, and retro policy.
- Repo-local AI guidance is present and tightened through `AGENTS.md`, `.codex/config/repo.json`, `.codex/rules/release-readiness.md`, `.codex/hooks/preflight.sh`, and `.codex/hooks/pre-handoff.md`.
- Product framing and critical user journey templates are present at `docs/product/prfaq.md` and `docs/product/critical-user-journeys.md`; the production profile references both.
- JSON parsing passed for `verification_contract.json`, `.jarvis/production_grade_profile.json`, and `.codex/config/repo.json`.
- `bash -n .codex/hooks/preflight.sh` passed.
- `git diff --check` passed.
- Python syntax gate is not applicable: no tracked Python files were found.
- Targeted live-secret scan returned no matches for live Clerk keys, private key material, or production-labeled PostgreSQL URLs outside ignored/generated paths and release archives.
- `npm test` passed: 14 of 14 `node --test` contract and product behavior tests.
- `npm ci` passed under local Node `v18.19.1` and npm `9.2.0`; npm emitted the known `EBADENGINE` warning for `eslint-visitor-keys@5.0.1`, which expects newer Node 20.x. CI and release verification remain contracted for Node 20.
- `npm run audit:critical` exited 0. The production audit still reports 8 non-critical production vulnerabilities: 5 high and 3 moderate. The fixes require separate behavior-tested dependency upgrade work.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ CLERK_SECRET_KEY=sk_test_placeholder npm run verify` passed: Prisma generate, Prisma validate, 14 tests, Next lint, TypeScript typecheck, and `next build`.
- `PORT=3210 ... npm run start` plus `HEALTH_URL=http://127.0.0.1:3210/health npm run smoke:health` passed against a locally started production build.
- `docker compose config --quiet` passed.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:32790/full_stack_school?schema=public npx prisma migrate deploy` passed against disposable `postgres:15` and applied both existing migrations.
- `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ -t full-stack-school:release-node-bceb23877923 .` passed. Docker reported a `689.7kB` build context.
- Local Docker shadow smoke passed for image `full-stack-school:release-node-bceb23877923`: `/health` passed before restart on `127.0.0.1:32787` and after `docker restart` on `127.0.0.1:32789`.
- `.codex/hooks/preflight.sh` passed as the repo-local bridge self-test equivalent: it confirmed `verification_contract.json` exists, ran `npm run audit:critical`, and ran `npm run verify`.
- No dedicated bridge self-test command exists in this repository: `rg -n "bridge self-test|self-test|selftest|bridge" . -g '!node_modules' -g '!.next' -g '!*.tar.gz'` returned no matches.
- Release bundle creation passed: `.codex/release/full-stack-school-release-readiness-baseline-2026-05-15.tar.gz` includes `AGENTS.md`, `verification_contract.json`, `.jarvis/production_grade_profile.json`, `.codex/config/repo.json`, `.codex/rules/release-readiness.md`, `.codex/hooks`, `.codex/reports/release-readiness.md`, and product planning docs.

## Node 9b9a8b0a3409 Revalidation

- The dirty tree at pickup was scoped to release-readiness governance and contract-test artifacts: `AGENTS.md`, `.codex/config/repo.json`, `.codex/reports/release-readiness.md`, `.codex/rules/release-readiness.md`, `.jarvis/production_grade_profile.json`, and `tests/contracts.test.mjs`.
- The mission-reported `verification_contract` blocker is not present in the current tree: `verification_contract.json` exists, parses, is referenced from repo guidance, and is covered by `tests/contracts.test.mjs`.
- The mission-reported production-grade profile `architecture` blocker is resolved: `.jarvis/production_grade_profile.json` now includes top-level `architecture` and `agile` sections, and contract tests assert the architecture summary, runtime topology, auth/data/deployment/secrets boundaries, release-risk surfaces, and decision policy.
- Repo-local AI operating guidance is present through `AGENTS.md`, `.codex/config/repo.json`, `.codex/rules/release-readiness.md`, `.codex/hooks/preflight.sh`, and `.codex/hooks/pre-handoff.md`.
- Product PRFAQ and critical user journey templates are present at `docs/product/prfaq.md` and `docs/product/critical-user-journeys.md`.
- JSON parsing passed for `verification_contract.json`, `.jarvis/production_grade_profile.json`, and `.codex/config/repo.json`.
- `bash -n .codex/hooks/preflight.sh` passed.
- `git diff --check` passed.
- Python syntax gate is not applicable: no Python files were found outside ignored/generated directories.
- Targeted live-secret scan returned no matches for live Clerk keys, private key material, or production-labeled PostgreSQL URLs outside ignored/generated paths and release archives.
- `npm test` passed: 14 of 14 `node --test` contract and product behavior tests.
- `npm ci` passed under local Node `v18.19.1` and npm `9.2.0`; npm emitted the known `EBADENGINE` warning for `eslint-visitor-keys@5.0.1`, which expects newer Node 20.x. CI and release verification remain contracted for Node 20.
- `npm run audit:critical` exited 0. `npm audit --omit=dev --audit-level=critical` still reports 8 non-critical production vulnerabilities: 5 high and 3 moderate, including Clerk, Next.js, lodash, lodash-es, postcss, nanoid, and @babel/runtime advisories. Remediation requires separate behavior-tested dependency work.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ CLERK_SECRET_KEY=sk_test_placeholder npm run verify` passed: Prisma generate, Prisma validate, 14 tests, Next lint, TypeScript typecheck, and `next build`.
- `PORT=3210 ... npm run start` plus `HEALTH_URL=http://127.0.0.1:3210/health npm run smoke:health` passed against a locally started production build, and the temporary process was stopped.
- `docker compose config --quiet` passed.
- `.codex/hooks/preflight.sh` passed as the repo-local bridge self-test equivalent: it confirmed `verification_contract.json` exists, ran `npm run audit:critical`, and ran `npm run verify`.
- No dedicated bridge self-test command exists in this repository: `rg -n "bridge self-test|self-test|selftest|bridge" . -g '!node_modules' -g '!.next' -g '!*.tar.gz'` returned no matches.
- `docker build --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZSQ -t full-stack-school:release-node-9b9a8b0a3409 .` passed. Docker reported a `690.2kB` build context and emitted non-blocking existing dependency/Browserslist warnings.
- `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:32791/full_stack_school?schema=public npx prisma migrate deploy` passed against disposable `postgres:15` and applied both existing migrations.
- Local Docker shadow smoke passed for image `full-stack-school:release-node-9b9a8b0a3409`: `/health` passed before restart on `127.0.0.1:32793`.
- Restart validation passed after re-reading Docker's current dynamic host port: an immediate probe of stale port `32793` failed after restart, Docker reported the container `healthy` on `127.0.0.1:32794`, and `HEALTH_URL=http://127.0.0.1:32794/health npm run smoke:health` passed.
- Temporary shadow app and disposable PostgreSQL containers were removed after verification.
- `git branch -vv` confirmed `harden/release-readiness-baseline` still does not track an upstream remote. `git push --dry-run -u origin harden/release-readiness-baseline` failed with HTTP 403 for GitHub user `5h4d0wn1k`, so PR publication remains blocked until a maintainer or writable remote pushes the branch.
- Release bundle creation passed: `.codex/release/full-stack-school-release-readiness-baseline-2026-05-20.tar.gz` includes `AGENTS.md`, `verification_contract.json`, `.jarvis/production_grade_profile.json`, `.codex/config/repo.json`, `.codex/rules/release-readiness.md`, `.codex/hooks`, `.codex/reports/release-readiness.md`, product planning docs, deploy safety docs, CI workflow, Docker files, scripts, and contract tests.

## Rollback Note

This hardening is rollbackable by reverting the pull request or redeploying the previous release artifact. Runtime rollback remains `previous_release` per `verification_contract.json` and `.jarvis/production_grade_profile.json`. The agile/profile, AGENTS, `.codex`, and contract-test updates are advisory/configuration-only and can be reverted without database or runtime state changes. The lockfile sync from the previous baseline remains rollbackable by reverting `package-lock.json` together with the existing dependency-baseline change in `package.json`. No Prisma migration, production deploy, or data change is included in this node.
