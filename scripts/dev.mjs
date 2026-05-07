import { spawn } from "node:child_process";
import { platform } from "node:os";

import { resolveNpmExecution } from "./prod-launcher.mjs";

export const PRODUCTION_SERVER_PORT = 3001;
export const DEFAULT_DEV_SERVER_PORT = 3002;

export function buildDevCommands(env) {
  const devPort = env.PORT ?? String(DEFAULT_DEV_SERVER_PORT);
  const apiTarget = env.VITE_API_TARGET ?? `http://localhost:${devPort}`;

  return [
    {
      name: "client",
      args: ["run", "dev", "--workspace", "client"],
      env: {
        ...env,
        VITE_API_TARGET: apiTarget
      }
    },
    {
      name: "server",
      args: ["run", "dev", "--workspace", "server"],
      env: {
        ...env,
        PORT: devPort
      }
    }
  ];
}

function runDev() {
  const execution = resolveNpmExecution({
    platformName: platform(),
    env: process.env,
    nodeExecutable: process.execPath
  });

  const commands = buildDevCommands(process.env);
  const children = commands.map((command) =>
    spawn(execution.command, [...execution.baseArgs, ...command.args], {
      cwd: process.cwd(),
      env: command.env,
      stdio: "inherit"
    })
  );

  let settled = false;

  function stopChildren() {
    for (const child of children) {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
    }
  }

  function finish(code) {
    if (settled) {
      return;
    }

    settled = true;
    stopChildren();
    process.exitCode = code;
  }

  for (const child of children) {
    child.on("exit", (code) => {
      finish(code ?? 0);
    });

    child.on("error", (error) => {
      console.error(error);
      finish(1);
    });
  }

  process.on("SIGINT", () => finish(0));
  process.on("SIGTERM", () => finish(0));
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  runDev();
}
