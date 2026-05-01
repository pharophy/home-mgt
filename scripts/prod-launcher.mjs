import { execFileSync } from "node:child_process";

export function resolveNpmExecution({
  platformName,
  env,
  nodeExecutable
}) {
  if (platformName === "win32" && env.npm_execpath) {
    return {
      command: nodeExecutable,
      baseArgs: [env.npm_execpath]
    };
  }

  return {
    command: platformName === "win32" ? "npm.cmd" : "npm",
    baseArgs: []
  };
}

export function runNpmCommand(commandArgs, options) {
  const execution = resolveNpmExecution(options);

  execFileSync(execution.command, [...execution.baseArgs, ...commandArgs], {
    stdio: "inherit",
    cwd: options.cwd
  });
}
