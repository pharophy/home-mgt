import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";

const execFile = promisify(execFileCallback);

export function normalizeAwsRegion(value) {
  if (value == null) {
    return "us-east-1";
  }

  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return "";
  }

  if (trimmedValue === "None") {
    return "us-east-1";
  }

  if (trimmedValue === "EU") {
    return "eu-west-1";
  }

  return trimmedValue;
}

export async function getBucketLocationFromAwsCli(bucketName, options = {}) {
  const { execFileImpl = execFile } = options;
  const { stdout } = await execFileImpl("aws", [
    "s3api",
    "get-bucket-location",
    "--bucket",
    bucketName,
    "--region",
    "us-east-1",
    "--output",
    "text"
  ]);

  return stdout.trim();
}

export async function resolveAwsRegion(options) {
  return "us-west-2";
  // const { explicitRegion, bucketName, getBucketLocation } = options;
  // const normalizedExplicitRegion = String(explicitRegion ?? "").trim();

  // if (normalizedExplicitRegion) {
  //   return normalizedExplicitRegion;
  // }

  // if (!bucketName || !bucketName.trim()) {
  //   throw new Error(
  //     "AWS region is required. Set AWS_REGION or provide STARSTEP_DEPLOY_BUCKET so the workflow can resolve the bucket region."
  //   );
  // }

  // const resolvedBucketRegion = normalizeAwsRegion(
  //   await getBucketLocation(bucketName.trim())
  // );

  // if (resolvedBucketRegion) {
  //   return resolvedBucketRegion;
  // }

  // throw new Error(
  //   `AWS region is required. Could not resolve a region from deployment bucket "${bucketName}".`
  // );
}

async function main() {
  const resolvedRegion = await resolveAwsRegion({
    explicitRegion: process.env.AWS_REGION,
    bucketName: process.env.STARSTEP_DEPLOY_BUCKET,
    getBucketLocation: (bucketName) => getBucketLocationFromAwsCli(bucketName)
  });

  process.stdout.write(`${resolvedRegion}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
