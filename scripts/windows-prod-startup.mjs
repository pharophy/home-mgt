import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const TASK_NAME = "HomeMgtProd";

export function ensureWindows(platformName) {
  if (platformName !== "win32") {
    throw new Error("Windows autostart is only supported on Windows.");
  }
}

export function getRepoRoot(scriptUrl = import.meta.url) {
  return path.resolve(path.dirname(fileURLToPath(scriptUrl)), "..");
}

function getPowerShellPath(windir = process.env.WINDIR ?? "C:\\Windows") {
  return path.join(windir, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
}

export function buildInstallTaskCommand({
  repoRoot = getRepoRoot(),
  windir = process.env.WINDIR ?? "C:\\Windows"
} = {}) {
  const powerShellPath = getPowerShellPath(windir);
  const startupScriptPath = path.join(repoRoot, "scripts", "prod-startup.ps1");
  return {
    file: "schtasks",
    args: [
      "/Create",
      "/TN",
      TASK_NAME,
      "/SC",
      "ONSTART",
      "/RU",
      "SYSTEM",
      "/TR",
      `"${powerShellPath}" -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "${startupScriptPath}"`,
      "/RL",
      "HIGHEST",
      "/F"
    ]
  };
}

export function buildUninstallTaskCommand() {
  return {
    file: "schtasks",
    args: ["/Delete", "/TN", TASK_NAME, "/F"]
  };
}

export function buildRunTaskCommand() {
  return {
    file: "schtasks",
    args: ["/Run", "/TN", TASK_NAME]
  };
}

export function runAutostartCommand(action, { platformName = process.platform, repoRoot = getRepoRoot() } = {}) {
  ensureWindows(platformName);
  const command = action === "install" ? buildInstallTaskCommand({ repoRoot }) : action === "uninstall" ? buildUninstallTaskCommand() : null;

  if (!command) {
    throw new Error(`Unknown autostart action: ${action}`);
  }

  execFileSync(command.file, command.args, {
    stdio: "inherit"
  });
}

const invokedDirectly = process.argv[1] === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const action = process.argv[2];

  if (action !== "install" && action !== "uninstall") {
    console.error("Usage: node scripts/windows-prod-startup.mjs <install|uninstall>");
    process.exitCode = 1;
  } else {
    try {
      runAutostartCommand(action);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
