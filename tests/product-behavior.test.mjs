import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { createRouteMatcher } = require("@clerk/nextjs/server");

const ROLES = ["admin", "teacher", "student", "parent"];

const readText = (path) => readFileSync(path, "utf8");
const normalize = (value) => value.replace(/\s+/g, " ").trim();

const loadTsModule = (path) => {
  const absolutePath = resolve(path);
  const source = readText(path);
  const result = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const module = { exports: {} };

  vm.runInNewContext(
    result.outputText,
    {
      exports: module.exports,
      module,
      require,
      console: { log() {} },
      __dirname: resolve(path, ".."),
      __filename: absolutePath,
    },
    { filename: absolutePath }
  );

  return module.exports;
};

const parseTsx = (path) => {
  const source = readText(path);

  return {
    path,
    source,
    sourceFile: ts.createSourceFile(
      path,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    ),
  };
};

const visit = (node, visitor) => {
  visitor(node);
  ts.forEachChild(node, (child) => visit(child, visitor));
};

const jsxNodes = (page, tagName) => {
  const nodes = [];

  visit(page.sourceFile, (node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(page.sourceFile) === tagName
    ) {
      nodes.push(node);
    }
  });

  return nodes;
};

const jsxAttr = (page, node, name) => {
  const attr = node.attributes.properties.find(
    (property) => ts.isJsxAttribute(property) && property.name.getText(page.sourceFile) === name
  );

  if (!attr) return undefined;
  if (!attr.initializer) return true;
  if (ts.isStringLiteral(attr.initializer)) return attr.initializer.text;
  if (ts.isJsxExpression(attr.initializer)) {
    return attr.initializer.expression?.getText(page.sourceFile) ?? "";
  }

  return attr.initializer.getText(page.sourceFile);
};

const jsxAttrValues = (page, tagName, attrName) =>
  jsxNodes(page, tagName)
    .map((node) => jsxAttr(page, node, attrName))
    .filter((value) => value !== undefined);

const assertJsx = (page, tagName, expectedAttrs = {}) => {
  const match = jsxNodes(page, tagName).find((node) =>
    Object.entries(expectedAttrs).every(([name, expected]) => jsxAttr(page, node, name) === expected)
  );

  assert.ok(
    match,
    `${page.path} should render <${tagName}> with ${JSON.stringify(expectedAttrs)}`
  );
};

const assertCall = (page, expressionText) => {
  let found = false;

  visit(page.sourceFile, (node) => {
    if (ts.isCallExpression(node) && node.expression.getText(page.sourceFile) === expressionText) {
      found = true;
    }
  });

  assert.ok(found, `${page.path} should call ${expressionText}()`);
};

const assertSourceContains = (page, snippet) => {
  assert.ok(
    normalize(page.source).includes(normalize(snippet)),
    `${page.path} should contain ${snippet}`
  );
};

const { routeAccessMap } = loadTsModule("src/lib/settings.ts");

const routeMatchers = Object.entries(routeAccessMap).map(([pattern, allowedRoles]) => ({
  pattern,
  allowedRoles,
  matches: createRouteMatcher([pattern]),
}));

const routingDecision = (path, role) => {
  const req = { nextUrl: new URL(`https://school.test${path}`) };
  const matchedRoute = routeMatchers.find(({ matches }) => matches(req));

  assert.ok(matchedRoute, `${path} should be covered by routeAccessMap`);

  if (matchedRoute.allowedRoles.includes(role)) {
    return { allowed: true, redirectPath: null, pattern: matchedRoute.pattern };
  }

  return { allowed: false, redirectPath: `/${role}`, pattern: matchedRoute.pattern };
};

const assertRoleAccess = (path, allowedRoles) => {
  const expectedAllowedRoles = new Set(allowedRoles);

  for (const role of ROLES) {
    const decision = routingDecision(path, role);
    const shouldAllow = expectedAllowedRoles.has(role);

    assert.equal(decision.allowed, shouldAllow, `${role} access to ${path}`);
    assert.equal(
      decision.redirectPath,
      shouldAllow ? null : `/${role}`,
      `${role} redirect target for ${path}`
    );
  }
};

test("role routing protects each role dashboard home", () => {
  assertRoleAccess("/admin", ["admin"]);
  assertRoleAccess("/teacher", ["teacher"]);
  assertRoleAccess("/student", ["student"]);
  assertRoleAccess("/parent", ["parent"]);
});

test("role routing protects high-value school workflow routes", () => {
  for (const [path, allowedRoles] of [
    ["/list/teachers", ["admin", "teacher"]],
    ["/list/teachers/teacher_1", ["admin", "teacher"]],
    ["/list/students", ["admin", "teacher"]],
    ["/list/students/student_1", ["admin", "teacher"]],
    ["/list/parents", ["admin", "teacher"]],
    ["/list/subjects", ["admin"]],
    ["/list/classes", ["admin", "teacher"]],
    ["/list/lessons", ["admin", "teacher"]],
    ["/list/exams", ROLES],
    ["/list/assignments", ROLES],
    ["/list/results", ROLES],
    ["/list/attendance", ROLES],
    ["/list/events", ROLES],
    ["/list/announcements", ROLES],
  ]) {
    assertRoleAccess(path, allowedRoles);
  }
});

test("middleware applies the role access map and leaves the health smoke route public", () => {
  const source = readText("src/middleware.ts");

  assert.match(source, /import\s+\{\s*routeAccessMap\s*\}\s+from\s+["']\.\/lib\/settings["']/);
  assert.match(source, /Object\.keys\(routeAccessMap\)\.map/);
  assert.match(source, /createRouteMatcher\(\[route\]\)/);
  assert.match(source, /allowedRoles\.includes\(role!\)/);
  assert.match(source, /NextResponse\.redirect\(new URL\(`\/\$\{role\}`,\s*req\.url\)\)/);
  assert.match(source, /health\|_next/);
});

test("dashboard layout stays per-request for Clerk-backed navigation", () => {
  const page = parseTsx("src/app/(dashboard)/layout.tsx");

  assertSourceContains(page, 'export const dynamic = "force-dynamic";');
  assertJsx(page, "Menu");
  assertJsx(page, "Navbar");
});

test("admin dashboard journey shows school-wide operational widgets", () => {
  const page = parseTsx("src/app/(dashboard)/admin/page.tsx");

  assert.deepEqual(jsxAttrValues(page, "UserCard", "type").sort(), [...ROLES].sort());
  assertJsx(page, "CountChartContainer");
  assertJsx(page, "AttendanceChartContainer");
  assertJsx(page, "FinanceChart");
  assertJsx(page, "EventCalendarContainer", { searchParams: "searchParams" });
  assertJsx(page, "Announcements");
});

test("teacher dashboard journey uses the signed-in teacher schedule", () => {
  const page = parseTsx("src/app/(dashboard)/teacher/page.tsx");

  assertCall(page, "auth");
  assertSourceContains(page, "const { userId } = auth();");
  assertJsx(page, "BigCalendarContainer", { type: "teacherId", id: "userId!" });
  assertJsx(page, "Announcements");
});

test("student dashboard journey scopes the schedule to the signed-in student's class", () => {
  const page = parseTsx("src/app/(dashboard)/student/page.tsx");

  assertCall(page, "auth");
  assertCall(page, "prisma.class.findMany");
  assertSourceContains(page, "students: { some: { id: userId! } }");
  assertJsx(page, "BigCalendarContainer", { type: "classId", id: "classItem[0].id" });
  assertJsx(page, "EventCalendar");
  assertJsx(page, "Announcements");
});

test("parent dashboard journey renders a child schedule for the signed-in parent", () => {
  const page = parseTsx("src/app/(dashboard)/parent/page.tsx");

  assertCall(page, "auth");
  assertCall(page, "prisma.student.findMany");
  assertSourceContains(page, "parentId: currentUserId!");
  assertSourceContains(page, "students.map((student) => (");
  assertJsx(page, "BigCalendarContainer", { type: "classId", id: "student.classId" });
  assertJsx(page, "Announcements");
});
