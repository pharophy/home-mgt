import assert from "node:assert/strict";

import { buildDevCommands, DEFAULT_DEV_SERVER_PORT, PRODUCTION_SERVER_PORT } from "./dev.mjs";

{
  const commands = buildDevCommands({});
  const serverCommand = commands.find((command) => command.name === "server");

  assert.ok(serverCommand);
  assert.equal(PRODUCTION_SERVER_PORT, 3001);
  assert.equal(DEFAULT_DEV_SERVER_PORT, 3002);
  assert.equal(serverCommand.env.PORT, String(DEFAULT_DEV_SERVER_PORT));
}

{
  const commands = buildDevCommands({});
  const clientCommand = commands.find((command) => command.name === "client");

  assert.ok(clientCommand);
  assert.equal(
    clientCommand.env.VITE_API_TARGET,
    `http://localhost:${DEFAULT_DEV_SERVER_PORT}`
  );
}

{
  const commands = buildDevCommands({
    PORT: "4100",
    VITE_API_TARGET: "http://localhost:4200"
  });
  const serverCommand = commands.find((command) => command.name === "server");
  const clientCommand = commands.find((command) => command.name === "client");

  assert.ok(serverCommand);
  assert.ok(clientCommand);
  assert.equal(serverCommand.env.PORT, "4100");
  assert.equal(clientCommand.env.VITE_API_TARGET, "http://localhost:4200");
}
