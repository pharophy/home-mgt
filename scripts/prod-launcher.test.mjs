import assert from "node:assert/strict";

import { resolveNpmExecution } from "./prod-launcher.mjs";

{
  const execution = resolveNpmExecution({
    platformName: "win32",
    env: {
      npm_execpath: "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js"
    },
    nodeExecutable: "C:\\Program Files\\nodejs\\node.exe"
  });

  assert.deepEqual(execution, {
    command: "C:\\Program Files\\nodejs\\node.exe",
    baseArgs: ["C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npm-cli.js"]
  });
}

{
  const execution = resolveNpmExecution({
    platformName: "win32",
    env: {},
    nodeExecutable: "C:\\Program Files\\nodejs\\node.exe"
  });

  assert.deepEqual(execution, {
    command: "npm.cmd",
    baseArgs: []
  });
}

{
  const execution = resolveNpmExecution({
    platformName: "linux",
    env: {},
    nodeExecutable: "/usr/bin/node"
  });

  assert.deepEqual(execution, {
    command: "npm",
    baseArgs: []
  });
}
