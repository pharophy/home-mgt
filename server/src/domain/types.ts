import type { Request } from "express";
import type { ActorContext, CelebrationMode, PreschoolParticipationState } from "@shared/preschool";
import type { ParticipationStore } from "../lib/store.js";
import type { SqlParticipationClient } from "../lib/sql-store.js";

export type {
  ActorRole,
  ActorContext,
  CelebrationMode,
  ChildProfile,
  Chore,
  Completion,
  CompletionItemType,
  CompletionStatus,
  HouseholdSettings,
  PreschoolParticipationState,
  RewardDefinition,
  RewardLedgerEntry,
  RewardType,
  Routine,
  RoutineStep,
  Weekday
} from "@shared/preschool";

export interface CreateAppOptions {
  dataFile?: string;
  store?: ParticipationStore;
  sqlConnectionString?: string;
  sqlClient?: SqlParticipationClient;
  completionImageService?: CompletionImageService;
}

export interface LegacyParticipationState
  extends Omit<Partial<PreschoolParticipationState>, "schemaVersion"> {
  schemaVersion?: number;
}

export interface AuthorizedRequest extends Request {
  actor: ActorContext;
}

export interface ValidationErrorBody {
  error: string;
}

export interface CompletionImageRequest {
  childName: string;
  activityName: string;
  interestThemes: string[];
  celebrationMode: CelebrationMode;
  variantSeed?: number;
}

export interface CompletionImageResult {
  imageUrl: string;
  prompt: string;
  selectedTheme: string;
}

export interface CompletionImageService {
  generateCelebrationImage(
    request: CompletionImageRequest
  ): Promise<CompletionImageResult>;
}
