import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const script = fs.readFileSync(new URL("./windows-ssm-deploy.ps1", import.meta.url), "utf8");

assert.match(
  script,
  /& schtasks \/Query \/TN \$ScheduledTaskName \| Out-Null[\s\S]*if \(\$LASTEXITCODE -ne 0\) \{\s*\$taskExists = \$false/s
);

assert.match(
  script,
  /sharedGeneratedAssetRoot[\s\S]*generated-assets[\s\S]*Copy-Item[\s\S]*sharedGeneratedAssetRoot/s
);

const stopIndex = script.indexOf("Stop-Process -Id $process.ProcessId -Force");
const endTaskIndex = script.indexOf("& schtasks.exe /End /TN $ScheduledTaskName | Out-Null");
const removeIndex = script.indexOf("Remove-Item -LiteralPath $currentRoot -Recurse -Force");
assert.ok(
  endTaskIndex >= 0 &&
    stopIndex >= 0 &&
    removeIndex >= 0 &&
    script.includes('dist/index.js') &&
    endTaskIndex < removeIndex &&
    stopIndex < removeIndex
);

const appRoot = fs.mkdtempSync(path.join(os.tmpdir(), "starstep-ssm-deploy-"));
const scriptPath = path.resolve("scripts", "windows-ssm-deploy.ps1");

try {
  const result = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-ArtifactUrl",
      "https://example.invalid/starstep-release.zip",
      "-ReleaseId",
      "test-release",
      "-AppRoot",
      appRoot
    ],
    {
      encoding: "utf8"
    }
  );

  const output = `${result.stdout}\n${result.stderr}`;

  assert.notEqual(result.status, 0);
  assert.match(output, /Expected shared environment file/i);
  assert.doesNotMatch(output, /Variable reference is not valid/i);
}
finally {
  fs.rmSync(appRoot, { recursive: true, force: true });
}
