import assert from "node:assert/strict";

import {
  TASK_NAME,
  buildInstallTaskCommand,
  buildUninstallTaskCommand,
  ensureWindows
} from "./windows-prod-startup.mjs";

{
  const command = buildInstallTaskCommand({
    repoRoot: "C:\\Users\\shawn\\Web Development\\home-mgt",
    windir: "C:\\Windows"
  });

  assert.equal(command.file, "reg");
  assert.deepEqual(command.args.slice(0, 7), [
    "add",
    "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    "/v",
    TASK_NAME,
    "/t",
    "REG_SZ",
    "/d"
  ]);
  assert.match(command.args[7], /^"C:\\Windows\\System32\\WindowsPowerShell\\v1\.0\\powershell\.exe"/);
  assert.match(command.args[7], /-WindowStyle Hidden/);
  assert.match(command.args[7], /scripts\\prod-startup\.ps1/);
  assert.equal(command.args[8], "/f");
}

{
  const command = buildUninstallTaskCommand();

  assert.equal(command.file, "reg");
  assert.deepEqual(command.args, [
    "delete",
    "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    "/v",
    TASK_NAME,
    "/f"
  ]);
}

assert.throws(() => ensureWindows("linux"), /Windows autostart is only supported on Windows\./);
