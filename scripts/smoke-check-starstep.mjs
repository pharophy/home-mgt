export function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export function buildSmokeCheckTargets(baseUrl) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  return {
    healthUrl: `${normalizedBaseUrl}/api/health`,
    shellUrl: `${normalizedBaseUrl}/`,
    stateUrl: `${normalizedBaseUrl}/api/state`
  };
}

async function expectJsonOk(url, validator, description) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${description} failed with ${response.status} ${response.statusText}`);
  }

  const body = await response.json();
  validator(body);
}

async function expectTextOk(url, validator, description) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${description} failed with ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  validator(body);
}

async function run() {
  const baseUrl = process.argv[2] ?? "https://starstep.blabberjax.com";
  const targets = buildSmokeCheckTargets(baseUrl);

  await expectJsonOk(
    targets.healthUrl,
    (body) => {
      if (body.status !== "ok") {
        throw new Error("Health endpoint did not report status=ok.");
      }
    },
    "Health check"
  );

  await expectTextOk(
    targets.shellUrl,
    (body) => {
      if (!body.includes("<!doctype html") && !body.includes("<!DOCTYPE html")) {
        throw new Error("App shell did not look like HTML.");
      }
    },
    "App shell check"
  );

  await expectJsonOk(
    targets.stateUrl,
    (body) => {
      if (!body || typeof body !== "object" || !("childProfiles" in body) || !("householdSettings" in body)) {
        throw new Error("State endpoint did not return the expected JSON shape.");
      }
    },
    "State check"
  );

  console.log(`Smoke checks passed for ${baseUrl}`);
}

const invokedDirectly = process.argv[1]?.endsWith("smoke-check-starstep.mjs");

if (invokedDirectly) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
