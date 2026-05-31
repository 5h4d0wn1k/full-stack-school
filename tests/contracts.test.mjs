import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readText = (path) => readFileSync(path, "utf8");

test("release readiness contract files are present and parseable", () => {
  const verificationContract = readJson("verification_contract.json");
  const agileWorkItem = readJson("agile_work_item.json");
  const productionProfile = readJson(".jarvis/production_grade_profile.json");
  const codexConfig = readJson(".codex/config/repo.json");

  assert.equal(verificationContract.workspace, "full-stack-school");
  assert.equal(verificationContract.agile_work_item_contract, "agile_work_item.json");
  assert.equal(agileWorkItem.workspace, "full-stack-school");
  assert.equal(agileWorkItem.contract_type, "agile_work_item");
  assert.equal(
    agileWorkItem.delivery_path,
    "branch -> pull request -> CI checks -> reviewed merge -> deploy"
  );
  assert.equal(
    agileWorkItem.source_of_truth.production_grade_profile,
    ".jarvis/production_grade_profile.json#agile"
  );
  for (const required of [
    "target_role",
    "critical_user_journey",
    "success_metric",
    "verification_plan",
    "rollback_or_abort_condition",
  ]) {
    assert.ok(
      agileWorkItem.required_fields.includes(required),
      `agile work item required_fields should include ${required}`
    );
  }
  assert.ok(
    agileWorkItem.definition_of_ready.some((item) =>
      item.includes("Target school role")
    ),
    "agile work item should name the target role in Definition of Ready"
  );
  assert.ok(
    agileWorkItem.definition_of_done.some((item) => item.includes("/health smoke")),
    "agile work item Definition of Done should include deploy-facing smoke evidence"
  );
  assert.equal(agileWorkItem.rollback.primary, "Revert the pull request or redeploy previous_release.");
  assert.equal(verificationContract.runtime.healthcheck, "/health");
  for (const source of [
    verificationContract.environment.env_file_source,
    productionProfile.deploy_contract.env_file_source,
    codexConfig.deploy_contract.env_file_source,
  ]) {
    assert.match(source, /process environment|deployment platform/);
    assert.match(source, /\.env|env file/i);
  }

  assert.equal(productionProfile.workspace, "full-stack-school");
  assert.equal(productionProfile.schema_version, 1);
  assert.equal(productionProfile.maturity.current_stage, "scaffolded");
  assert.equal(productionProfile.maturity.current_score_percent, 36);
  assert.equal(productionProfile.maturity.last_ratchet.node, "node-7cb12d4685c0");
  assert.ok(
    productionProfile.maturity.last_ratchet.evidence.includes("agile_work_item.json"),
    "maturity ratchet evidence should include the agile work-item contract"
  );
  assert.ok(
    productionProfile.maturity.last_ratchet.evidence.includes(
      ".codex/evidence/wip-quarantine-20260531T013254Z.tar.gz"
    ),
    "maturity ratchet evidence should include the current dirty-worktree quarantine bundle"
  );
  assert.equal(productionProfile.repo_contract.agile_work_item_contract, "agile_work_item.json");
  assert.equal(productionProfile.product.name, "Lama Dev School Management Dashboard");
  assert.equal(productionProfile.product.product_brief, "docs/product/prfaq.md");
  assert.equal(
    productionProfile.product.journey_map,
    "docs/product/critical-user-journeys.md"
  );
  assert.ok(
    productionProfile.product.critical_user_journeys.length >= 4,
    "production profile should name the critical user journeys"
  );
  assert.equal(
    productionProfile.architecture.summary.includes("Next.js App Router"),
    true
  );
  for (const required of [
    "runtime_topology",
    "critical_boundaries",
    "release_risk_surfaces",
    "decision_policy",
  ]) {
    assert.ok(
      productionProfile.architecture[required],
      `production profile architecture.${required} is required`
    );
  }
  for (const boundary of ["auth", "data", "deployment", "secrets"]) {
    assert.ok(
      productionProfile.architecture.critical_boundaries[boundary],
      `production profile architecture critical boundary ${boundary} is required`
    );
  }
  assert.ok(
    productionProfile.architecture.release_risk_surfaces.some((item) =>
      item.includes("Prisma")
    ),
    "architecture release risk surfaces should include Prisma"
  );
  assert.equal(productionProfile.verification.contract_file, "verification_contract.json");
  assert.equal(productionProfile.verification.default_gate, "npm run verify");
  for (const required of [
    "minimum_local_checks",
    "release_promotion_checks",
    "deploy_facing_checks",
    "regression_risk_controls",
    "evidence_policy",
    "blocked_gate_policy",
    "runtime_notes",
  ]) {
    assert.ok(
      productionProfile.verification[required],
      `production profile verification.${required} is required`
    );
  }
  assert.ok(
    productionProfile.verification.minimum_local_checks.includes("npm run build"),
    "verification minimum local checks should include build"
  );
  assert.ok(
    productionProfile.verification.release_promotion_checks.includes("npm run audit:critical"),
    "verification release promotion checks should include critical audit"
  );
  assert.ok(
    productionProfile.verification.deploy_facing_checks.includes("npm run smoke:health"),
    "verification deploy-facing checks should include health smoke"
  );
  assert.equal(
    productionProfile.release.default_path,
    "branch -> pull request -> CI checks -> reviewed merge -> deploy"
  );
  for (const required of [
    "strategy",
    "rollback_action",
    "risk_classification",
    "promotion_gates",
    "deploy_sequence",
    "abort_conditions",
    "rollback",
    "evidence_required",
  ]) {
    assert.ok(
      productionProfile.release[required],
      `production profile release.${required} is required`
    );
  }
  assert.match(productionProfile.release.rollback_action, /previous_release/);
  assert.match(productionProfile.release.rollback_action, /pull request/);
  assert.equal(productionProfile.release.rollback.runtime, "previous_release");
  assert.ok(
    productionProfile.release.promotion_gates.includes("npm run verify"),
    "release promotion gates should include npm run verify"
  );
  assert.ok(
    productionProfile.release.abort_conditions.some((item) =>
      item.includes("Critical production dependency audit")
    ),
    "release abort conditions should include the critical audit gate"
  );
  for (const required of [
    "service_level_intent",
    "health_model",
    "slo_candidates",
    "failure_modes",
    "observability",
    "operational_response",
    "capacity_assumptions",
  ]) {
    assert.ok(
      productionProfile.reliability[required],
      `production profile reliability.${required} is required`
    );
  }
  assert.match(productionProfile.reliability.health_model.process_health, /\/health/);
  assert.ok(
    productionProfile.reliability.failure_modes.some((item) => item.includes("Clerk")),
    "reliability failure modes should include Clerk dependency risk"
  );
  assert.ok(
    productionProfile.reliability.observability.required_signals.some((item) =>
      item.includes("/health")
    ),
    "reliability observability signals should include /health smoke"
  );
  assert.match(productionProfile.reliability.operational_response.rollback, /previous_release/);
  for (const required of [
    "service_scope",
    "responsible_roles",
    "operational_expectations",
    "escalation_path",
    "runbooks",
    "handoff_requirements",
    "open_owner_gaps",
  ]) {
    assert.ok(
      productionProfile.ownership[required],
      `production profile ownership.${required} is required`
    );
  }
  assert.equal(productionProfile.ownership.responsible_roles.release_manager, "owners.release_manager");
  assert.ok(
    productionProfile.ownership.service_scope.owns.some((item) => item.includes("/health")),
    "ownership service scope should include the app health check"
  );
  assert.ok(
    productionProfile.ownership.escalation_path.some((item) =>
      item.includes("incident commander")
    ),
    "ownership escalation path should include incident commander escalation"
  );
  assert.ok(
    productionProfile.ownership.runbooks.includes("docs/operations/deploy-safety.md"),
    "ownership runbooks should include deploy safety docs"
  );
  assert.ok(
    productionProfile.ownership.open_owner_gaps.some((item) => item.includes("TBD")),
    "ownership should record unresolved human owner gaps"
  );
  for (const required of [
    "maturity_goal",
    "ratchet_loops",
    "scorecard_inputs",
    "learning_capture",
    "recurring_blocker_policy",
    "next_improvement_candidates",
  ]) {
    assert.ok(
      productionProfile.continuous_improvement[required],
      `production profile continuous_improvement.${required} is required`
    );
  }
  assert.match(productionProfile.continuous_improvement.maturity_goal, /self_improving/);
  assert.ok(
    productionProfile.continuous_improvement.ratchet_loops.some((item) =>
      item.includes("dirty worktree")
    ),
    "continuous improvement ratchets should preserve dirty-worktree quarantine"
  );
  assert.ok(
    productionProfile.continuous_improvement.scorecard_inputs.some((item) =>
      item.includes("verification_contract.json")
    ),
    "continuous improvement scorecard should include verification contract evidence"
  );
  assert.match(
    productionProfile.continuous_improvement.recurring_blocker_policy,
    /active, stale, credential-blocked, or superseded/
  );
  assert.equal(
    productionProfile.agile.release_planning.default_path,
    "branch -> pull request -> CI checks -> reviewed merge -> deploy"
  );
  assert.equal(productionProfile.agile.work_item_contract, "agile_work_item.json");
  for (const required of [
    "planning_cadence",
    "backlog_policy",
    "work_item_flow",
    "definition_of_ready",
    "definition_of_done",
    "release_planning",
    "metrics",
    "retro_policy",
  ]) {
    assert.ok(productionProfile.agile[required], `production profile agile.${required} is required`);
  }
  assert.ok(
    productionProfile.agile.definition_of_ready.some((item) =>
      item.includes("critical user journey")
    ),
    "definition_of_ready should require critical user journey framing"
  );
  assert.ok(
    productionProfile.agile.definition_of_done.some((item) =>
      item.includes("npm run verify")
    ),
    "definition_of_done should require verification evidence"
  );
  assert.equal(productionProfile.deploy_contract.healthcheck, "/health");
  assert.equal(productionProfile.deploy_contract.rollback, "previous_release");

  assert.equal(codexConfig.workspace, "full-stack-school");
  assert.equal(codexConfig.git_hygiene.upstream_tracking_required_for_pr, true);
  assert.equal(codexConfig.git_hygiene.dirty_worktree_quarantine_required, true);
  assert.match(codexConfig.git_hygiene.dirty_worktree_evidence_dir, /\.codex\/evidence\//);
  assert.match(codexConfig.git_hygiene.dirty_worktree_policy, /git diff --binary/);
  assert.equal(
    codexConfig.git_hygiene.current_blocker_documented_in,
    ".codex/reports/release-readiness.md#node-7cb12d4685c0-revalidation"
  );
  assert.match(codexConfig.git_hygiene.delivery_remote_policy, /writable remote/);
  assert.equal(codexConfig.verification_contract, "verification_contract.json");
  assert.equal(codexConfig.production_grade_profile, ".jarvis/production_grade_profile.json");
  assert.equal(
    codexConfig.production_profile_release,
    ".jarvis/production_grade_profile.json#release"
  );
  assert.equal(
    codexConfig.production_profile_release_rollback_action,
    ".jarvis/production_grade_profile.json#release.rollback_action"
  );
  assert.equal(
    codexConfig.production_profile_verification,
    ".jarvis/production_grade_profile.json#verification"
  );
  assert.equal(
    codexConfig.production_profile_reliability,
    ".jarvis/production_grade_profile.json#reliability"
  );
  assert.equal(
    codexConfig.production_profile_ownership,
    ".jarvis/production_grade_profile.json#ownership"
  );
  assert.equal(
    codexConfig.production_profile_continuous_improvement,
    ".jarvis/production_grade_profile.json#continuous_improvement"
  );
  assert.equal(codexConfig.agile_work_item_contract, "agile_work_item.json");
  assert.equal(codexConfig.product_brief, "docs/product/prfaq.md");
  assert.equal(codexConfig.critical_user_journeys, "docs/product/critical-user-journeys.md");
  assert.equal(codexConfig.deploy_contract.healthcheck, "/health");
  assert.equal(codexConfig.deploy_contract.rollback, "previous_release");
});

test("ci workflow covers the required release gates", () => {
  const workflow = readText(".github/workflows/ci.yml");

  for (const required of [
    "npm ci",
    "npm run audit:critical",
    "npx prisma migrate deploy",
    "npm run verify",
    "npm run smoke:health",
    "postgres:15",
  ]) {
    assert.match(workflow, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("repo guidance names the PR-first and rollback posture", () => {
  const agents = readText("AGENTS.md");
  const rules = readText(".codex/rules/release-readiness.md");
  const preflight = readText(".codex/hooks/preflight.sh");
  const report = readText(".codex/reports/release-readiness.md");

  assert.match(agents, /pull request/i);
  assert.match(agents, /upstream remote/i);
  assert.match(agents, /dirty.*worktree/i);
  assert.match(agents, /\.codex\/evidence\//);
  assert.match(agents, /PRFAQ/i);
  assert.match(agents, /critical user journey/i);
  assert.match(agents, /agile_work_item\.json/);
  assert.match(agents, /architecture/i);
  assert.match(agents, /reliability/i);
  assert.match(agents, /ownership/i);
  assert.match(agents, /continuous_improvement/i);
  assert.match(rules, /rollback/i);
  assert.match(rules, /git branch -vv/);
  assert.match(rules, /dirty.*worktree/i);
  assert.match(rules, /git diff --binary/);
  assert.match(rules, /Definition of Ready/i);
  assert.match(rules, /agile_work_item\.json/);
  assert.match(rules, /architecture boundaries/i);
  assert.match(rules, /health model/i);
  assert.match(rules, /env_file_source/);
  assert.match(rules, /release owner/i);
  assert.match(rules, /scorecard/i);
  assert.match(preflight, /env_file_source/);
  assert.match(preflight, /dirty worktree detected/);
  assert.match(preflight, /PR publication requires a writable remote or maintainer push/);
  assert.match(report, /Delivery Blockers/i);
  assert.match(report, /upstream remote/i);
});

test("deploy safety docs name the environment source contract", () => {
  const deploySafety = readText("docs/operations/deploy-safety.md");

  assert.match(deploySafety, /env_file_source/);
  assert.match(deploySafety, /process environment/);
  assert.match(deploySafety, /committed `\.env` files/);
});

test("docker compose database wiring is internally consistent", () => {
  const compose = readText("docker-compose.yml");

  assert.match(compose, /services:\n\s+postgres:/);
  assert.doesNotMatch(compose, /\bpostgress\b/);
  assert.match(
    compose,
    /DATABASE_URL:\s+postgresql:\/\/myuser:mypassword@postgres:5432\/mydb\?schema=public/
  );
});

test("docker build context excludes generated artifacts and local secrets", () => {
  const dockerignore = readText(".dockerignore");

  for (const required of [
    "node_modules",
    ".next",
    ".env.*",
    ".codex",
    ".jarvis",
    "tests",
    "*.tsbuildinfo",
  ]) {
    assert.match(dockerignore, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("clean checkouts include the Next.js TypeScript environment shim", () => {
  const nextEnv = readText("next-env.d.ts");

  assert.match(nextEnv, /<reference types="next"/);
  assert.match(nextEnv, /<reference types="next\/image-types\/global"/);
});
