import type { CelebrationMode } from "./types";

export type CompletionImageRequest = {
  childName: string;
  activityName: string;
  interestThemes: string[];
  celebrationMode: CelebrationMode;
  variantSeed?: number;
};

export type CompletionImageResult = {
  imageUrl: string;
  prompt: string;
  selectedTheme: string;
};

export type InstructionalImageRequest = {
  activityName: string;
  stepLabels: string[];
};

export type InstructionalImageResult = {
  imageUrl: string;
  prompt: string;
};

type CompletionImageGenerator = (
  request: CompletionImageRequest
) => Promise<CompletionImageResult>;

type InstructionalImageGenerator = (
  request: InstructionalImageRequest
) => Promise<InstructionalImageResult>;

let testGenerator: CompletionImageGenerator | null = null;
let testInstructionalGenerator: InstructionalImageGenerator | null = null;

export function __setCompletionImageGeneratorForTests(
  generator: CompletionImageGenerator | null
): void {
  testGenerator = generator;
}

export function __setInstructionalImageGeneratorForTests(
  generator: InstructionalImageGenerator | null
): void {
  testInstructionalGenerator = generator;
}

export function selectCompletionTheme(
  interestThemes: string[],
  variantSeed: number
): string {
  const cleanedThemes = interestThemes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0);

  if (cleanedThemes.length === 0) {
    return "playful preschool adventure";
  }

  return cleanedThemes[Math.abs(variantSeed) % cleanedThemes.length] ?? cleanedThemes[0];
}

export function buildCompletionImagePrompt({
  childName,
  activityName,
  interestThemes,
  selectedTheme
}: {
  childName: string;
  activityName: string;
  interestThemes: string[];
  selectedTheme: string;
}): string {
  const supportingThemes = interestThemes
    .map((theme) => theme.trim())
    .filter((theme) => theme.length > 0)
    .join(", ");

  return [
    `Create an original celebratory illustration for ${childName} after completing ${activityName}.`,
    `Use ${selectedTheme} and ${supportingThemes || "playful preschool adventure"} as inspiration themes only.`,
    "Keep it bright, friendly, and suitable for a preschool reward moment.",
    "Do not depict copyrighted characters, franchise names, logos, or exact branded scenes."
  ].join(" ");
}

export function buildInstructionalImagePrompt({
  activityName,
  stepLabels
}: {
  activityName: string;
  stepLabels: string[];
}): string {
  const stepContext = stepLabels
    .map((label) => label.trim())
    .filter((label) => label.length > 0)
    .join(", ");

  return [
    `Create an instructional image for the activity "${activityName}".`,
    stepContext
      ? `Show what to do using these subtask details: ${stepContext}.`
      : "Focus on a clear single preschool action.",
    "Keep the image legible, friendly, and useful as a stable task picture."
  ].join(" ");
}

function svgDataUrl(label: string, theme: string, celebrationMode: CelebrationMode): string {
  const background =
    celebrationMode === "gentle"
      ? "#e8f6ef"
      : "#fff0c7";
  const accent = celebrationMode === "gentle" ? "#58a27c" : "#f08a24";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <rect width="320" height="200" rx="24" fill="${background}" />
      <circle cx="56" cy="46" r="18" fill="${accent}" opacity="0.35" />
      <circle cx="270" cy="54" r="14" fill="${accent}" opacity="0.22" />
      <text x="24" y="88" font-size="18" font-family="Arial, sans-serif" fill="#243042">${label}</text>
      <text x="24" y="122" font-size="14" font-family="Arial, sans-serif" fill="#526173">Inspired by ${theme}</text>
      <text x="24" y="156" font-size="12" font-family="Arial, sans-serif" fill="#7a8794">Original celebration art</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function defaultGenerator(
  request: CompletionImageRequest
): Promise<CompletionImageResult> {
  const selectedTheme = selectCompletionTheme(
    request.interestThemes,
    request.variantSeed ?? Date.now()
  );
  const prompt = buildCompletionImagePrompt({
    childName: request.childName,
    activityName: request.activityName,
    interestThemes: request.interestThemes,
    selectedTheme
  });

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });

  return {
    imageUrl: svgDataUrl(request.activityName, selectedTheme, request.celebrationMode),
    prompt,
    selectedTheme
  };
}

async function defaultInstructionalGenerator(
  request: InstructionalImageRequest
): Promise<InstructionalImageResult> {
  const prompt = buildInstructionalImagePrompt(request);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });

  return {
    imageUrl: svgDataUrl(
      request.activityName,
      request.stepLabels[0] ?? "preschool task",
      "gentle"
    ),
    prompt
  };
}

export async function generateCompletionImage(
  request: CompletionImageRequest
): Promise<CompletionImageResult> {
  if (testGenerator) {
    return testGenerator(request);
  }

  return defaultGenerator(request);
}

export async function generateInstructionalImage(
  request: InstructionalImageRequest
): Promise<InstructionalImageResult> {
  if (testInstructionalGenerator) {
    return testInstructionalGenerator(request);
  }

  return defaultInstructionalGenerator(request);
}
