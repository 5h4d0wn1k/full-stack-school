import { spawnSync } from "node:child_process";

const fallbackDatabaseUrl =
  "postgresql://postgres:postgres@localhost:5432/full_stack_school?schema=public";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "validate"], {
  env: {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
  stdio: "inherit",
});

process.exit(result.status ?? 1);
