import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { resolveManagedGeneratedAssetDir } from "./image-assets.js";

test("resolveManagedGeneratedAssetDir prefers shared generated assets for deployed releases", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "home-mgt-image-assets-"));
  try {
    const currentRoot = path.join(repoRoot, "current");
    const sharedRoot = path.join(repoRoot, "shared");
    await mkdir(currentRoot, { recursive: true });
    await mkdir(sharedRoot, { recursive: true });

    assert.equal(
      resolveManagedGeneratedAssetDir(currentRoot),
      path.join(sharedRoot, "generated-assets")
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});

test("resolveManagedGeneratedAssetDir falls back to the release directory when shared assets are absent", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "home-mgt-image-assets-"));
  try {
    const currentRoot = path.join(repoRoot, "current");
    await mkdir(currentRoot, { recursive: true });

    assert.equal(
      resolveManagedGeneratedAssetDir(currentRoot),
      path.join(repoRoot, "generated-assets")
    );
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
