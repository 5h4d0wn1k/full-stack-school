# Release Readiness Rules

These repo-local rules are meant to keep future AI and human changes aligned with the release contract.

## Delivery

- Work on a branch and use pull requests for normal code, config, and workflow changes.
- Keep production-impacting changes additive or rollbackable unless an approved migration plan exists.
- Do not deploy directly from an AI session. Produce evidence, then let the release owner approve deployment.

## Product Planning

- Check `.jarvis/production_grade_profile.json` for architecture boundaries before changing auth, Prisma, middleware, Docker, CI, or deployment behavior.
- Use the agile operating section in `.jarvis/production_grade_profile.json` for Definition of Ready and Definition of Done.
- Before major feature work, update or reference `docs/product/prfaq.md` and `docs/product/critical-user-journeys.md`.
- Name the target school role, success metric, failure-sensitive points, and rollback or abort condition before broad implementation.

## Verification

- Follow `verification_contract.json` before claiming completion.
- Use `.jarvis/production_grade_profile.json#release` to confirm delivery path, promotion gates, abort conditions, and rollback posture.
- Use `.jarvis/production_grade_profile.json#verification` to select minimum, release-promotion, and deploy-facing checks.
- Use `npm ci` for deterministic installs.
- Run `npm run audit:critical` before release promotion so critical production advisories block delivery.
- Run `npm test` for repo contract regression coverage.
- Run `npm run verify` after dependency, TypeScript, Prisma, routing, or CI changes.
- For deploy-facing changes, start the built app and run `npm run smoke:health`.
- If a required gate cannot run, record the blocker and residual risk in `.codex/reports/release-readiness.md`.

## Data And Secrets

- Never commit `.env`, real Clerk keys, production database URLs, dumps, or student/family data.
- Treat Prisma migrations as production-affecting changes that require backward compatibility and rollback notes.
- Do not run destructive database commands against shared or production databases from this workspace.

## Release Safety

- Keep `/health` cheap and dependency-light so it can distinguish app process health from database reachability.
- Roll back by reverting the PR or redeploying the previous known-good artifact.
- Keep Docker image builds database-side-effect-free; run production migrations with `prisma migrate deploy` as an explicit release step.
- Keep `.dockerignore` excluding generated local artifacts, secrets, and evidence bundles from container build context.
