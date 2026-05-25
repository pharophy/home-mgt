import assert from "node:assert/strict";

import {
  normalizeAwsRegion,
  resolveAwsRegion
} from "./resolve-aws-region.mjs";

await assert.doesNotReject(async () => {
  const resolvedRegion = await resolveAwsRegion({
    explicitRegion: "us-west-2",
    bucketName: "starstep-deployments",
    getBucketLocation: async () => {
      throw new Error("bucket lookup should not run when the explicit region is set");
    }
  });

  assert.equal(resolvedRegion, "us-west-2");
});

await assert.doesNotReject(async () => {
  const resolvedRegion = await resolveAwsRegion({
    explicitRegion: "",
    bucketName: "starstep-deployments",
    getBucketLocation: async (bucketName) => {
      assert.equal(bucketName, "starstep-deployments");
      return "us-east-2";
    }
  });

  assert.equal(resolvedRegion, "us-east-2");
});

assert.equal(normalizeAwsRegion(null), "us-east-1");
assert.equal(normalizeAwsRegion("None"), "us-east-1");
assert.equal(normalizeAwsRegion("EU"), "eu-west-1");
assert.equal(normalizeAwsRegion(" us-west-1 "), "us-west-1");

await assert.rejects(
  () =>
    resolveAwsRegion({
      explicitRegion: "",
      bucketName: "",
      getBucketLocation: async () => "us-west-2"
    }),
  /AWS region is required/i
);
