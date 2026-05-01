import { platform } from "node:os";
import { runNpmCommand } from "./prod-launcher.mjs";

function run(commandArgs) {
  runNpmCommand(commandArgs, {
    platformName: platform(),
    env: process.env,
    nodeExecutable: process.execPath,
    cwd: process.cwd()
  });
}

run(["run", "build", "--workspace", "client"]);
run(["run", "build", "--workspace", "server"]);
run(["run", "start", "--workspace", "server"]);
