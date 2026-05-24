import assert from "node:assert/strict";

import { buildSmokeCheckTargets, normalizeBaseUrl } from "./smoke-check-starstep.mjs";

{
  assert.equal(normalizeBaseUrl("https://starstep.blabberjax.com/"), "https://starstep.blabberjax.com");
  assert.equal(normalizeBaseUrl("https://starstep.blabberjax.com"), "https://starstep.blabberjax.com");
}

{
  const targets = buildSmokeCheckTargets("https://starstep.blabberjax.com");

  assert.deepEqual(targets, {
    healthUrl: "https://starstep.blabberjax.com/api/health",
    shellUrl: "https://starstep.blabberjax.com/",
    stateUrl: "https://starstep.blabberjax.com/api/state"
  });
}
