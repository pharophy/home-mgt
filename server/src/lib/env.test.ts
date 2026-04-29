import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { resolveProjectEnvPath } from "./env.js";

test("resolves the shared root .env when launched from the repository root", () => {
  const repoRoot = path.resolve(process.cwd(), "..");

  assert.equal(resolveProjectEnvPath(repoRoot), path.join(repoRoot, ".env"));
});

test("resolves the shared root .env when launched from the server workspace", () => {
  const repoRoot = path.resolve(process.cwd(), "..");
  const serverWorkspace = path.join(repoRoot, "server");

  assert.equal(resolveProjectEnvPath(serverWorkspace), path.join(repoRoot, ".env"));
});
