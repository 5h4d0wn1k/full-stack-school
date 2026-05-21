# Pre-Handoff Checklist

Use this before final response or PR handoff.

1. Confirm `git status --short --branch` and make sure changed files are inside the requested scope.
2. Review `git diff --stat` and `git diff` for accidental behavior, secret, dependency, or generated-artifact changes.
3. Run JSON and JavaScript syntax checks for changed contract and script files.
4. Confirm `.jarvis/production_grade_profile.json` includes the top-level `release` and `verification` sections and use them to select release gates and rollback posture.
5. Run the verification contract in `verification_contract.json`; if blocked, document the blocker.
6. For deploy-facing work, confirm `/health`, rollback target, and smoke evidence.
7. Update `.codex/reports/release-readiness.md` with exact commands, outcomes, and remaining risks.
8. Summarize rollback as either PR revert, previous release redeploy, or a specific staged migration plan.
