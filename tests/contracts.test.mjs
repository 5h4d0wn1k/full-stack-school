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
  assert.equal(productionProfile.deploy_contract.healthcheck, "/health");
  assert.equal(productionProfile.deploy_contract.rollback, "previous_release");

  assert.equal(codexConfig.workspace, "full-stack-school");
  assert.equal(codexConfig.verification_contract, "verification_contract.json");
  assert.equal(codexConfig.production_grade_profile, ".jarvis/production_grade_profile.json");
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
  assert.match(rules, /rollback/i);
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
