import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const readText = (path) => readFileSync(path, "utf8");

test("release readiness contract files are present and parseable", () => {
  const verificationContract = readJson("verification_contract.json");
  const productionProfile = readJson(".jarvis/production_grade_profile.json");
  const codexConfig = readJson(".codex/config/repo.json");

  assert.equal(verificationContract.workspace, "full-stack-school");
  assert.equal(verificationContract.runtime.healthcheck, "/health");
  assert.equal(verificationContract.environment.env_file_source.includes("process environment"), true);

  assert.equal(productionProfile.workspace, "full-stack-school");
  assert.equal(productionProfile.schema_version, 1);
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
  assert.equal(
    productionProfile.agile.release_planning.default_path,
    "branch -> pull request -> CI checks -> reviewed merge -> deploy"
  );
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
  assert.equal(codexConfig.verification_contract, "verification_contract.json");
  assert.equal(codexConfig.production_grade_profile, ".jarvis/production_grade_profile.json");
  assert.equal(codexConfig.product_brief, "docs/product/prfaq.md");
  assert.equal(codexConfig.critical_user_journeys, "docs/product/critical-user-journeys.md");
  assert.equal(codexConfig.deploy_contract.healthcheck, "/health");
  assert.equal(codexConfig.deploy_contract.rollback, "previous_release");
  assert.equal(codexConfig.deploy_contract.env_file_source.includes("process environment"), true);
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
  const report = readText(".codex/reports/release-readiness.md");

  assert.match(agents, /pull request/i);
  assert.match(agents, /PRFAQ/i);
  assert.match(agents, /critical user journey/i);
  assert.match(agents, /architecture/i);
  assert.match(rules, /rollback/i);
  assert.match(rules, /Definition of Ready/i);
  assert.match(rules, /architecture boundaries/i);
  assert.match(report, /Delivery Blockers/i);
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
