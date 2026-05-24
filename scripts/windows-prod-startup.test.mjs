import assert from "node:assert/strict";

import {
  TASK_NAME,
  buildInstallTaskCommand,
  buildRunTaskCommand,
  buildUninstallTaskCommand,
  ensureWindows
} from "./windows-prod-startup.mjs";

{
  const command = buildInstallTaskCommand({
    repoRoot: "C:\\Users\\shawn\\Web Development\\home-mgt",
    windir: "C:\\Windows"
  });

  assert.equal(command.file, "schtasks");
  assert.deepEqual(command.args.slice(0, 7), [
    "/Create",
    "/TN",
    TASK_NAME,
    "/SC",
    "ONSTART",
    "/RU",
    "SYSTEM"
  ]);
  assert.equal(command.args[7], "/TR");
  assert.match(command.args[8], /^"C:\\Windows\\System32\\WindowsPowerShell\\v1\.0\\powershell\.exe"/);
  assert.match(command.args[8], /-WindowStyle Hidden/);
  assert.match(command.args[8], /scripts\\prod-startup\.ps1/);
  assert.equal(command.args.at(-1), "/F");
}

{
  const command = buildUninstallTaskCommand();

  assert.equal(command.file, "schtasks");
  assert.deepEqual(command.args, [
    "/Delete",
    "/TN",
    TASK_NAME,
    "/F"
  ]);
}

{
  const command = buildRunTaskCommand();

  assert.equal(command.file, "schtasks");
  assert.deepEqual(command.args, [
    "/Run",
    "/TN",
    TASK_NAME
  ]);
}

assert.throws(() => ensureWindows("linux"), /Windows autostart is only supported on Windows\./);
