import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
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

test("falls back to the shared root .env.prod when .env is absent", () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "home-mgt-env-"));
  const serverWorkspace = path.join(tempRoot, "server");
  fs.mkdirSync(serverWorkspace, { recursive: true });
  fs.writeFileSync(path.join(tempRoot, ".env.prod"), "OPENAI_API_KEY=test\n", "utf8");

  try {
    assert.equal(resolveProjectEnvPath(serverWorkspace), path.join(tempRoot, ".env.prod"));
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});
