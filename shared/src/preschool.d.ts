export type ActorRole = "parentAdmin" | "childDisplay";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type RewardType = "stars" | "stickers";
export type CompletionItemType = "routineStep" | "routine" | "chore";
export type CompletionStatus = "completed" | "pendingApproval" | "approved";
export type CelebrationMode = "full" | "gentle";

export interface ActorContext {
  id: string;
  role: ActorRole;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  color: string;
  motivators: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RewardDefinition {
  type: RewardType;
  amount: number;
}

export interface RoutineStep {
  id: string;
  label: string;
  icon?: string;
  imageUrl?: string;
  order: number;
}

export interface Routine {
  id: string;
  childProfileId: string;
  name: string;
  imageUrl?: string;
  schedule: {
    days: Weekday[];
  };
  steps: RoutineStep[];
  reward?: RewardDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface Chore {
  id: string;
  childProfileId: string;
  name: string;
  imageUrl?: string;
  recurrence: {
    days: Weekday[];
  };
  requiresApproval: boolean;
  reward?: RewardDefinition;
  createdAt: string;
  updatedAt: string;
}

export interface Completion {
  id: string;
  itemType: CompletionItemType;
  itemId: string;
  childProfileId: string;
  scheduledDay?: Weekday;
  parentEntityType?: "routine" | "chore";
  parentEntityId?: string;
  status: CompletionStatus;
  recordedBy: ActorContext;
  completedAt: string;
  approvedAt?: string;
  approvedBy?: ActorContext;
  celebrationImageUrl?: string;
  celebrationPrompt?: string;
  celebrationTheme?: string;
  celebrationGeneratedAt?: string;
}

export interface RewardLedgerEntry {
  id: string;
  childProfileId: string;
  sourceType: "routine" | "chore";
  sourceId: string;
  completionId: string;
  rewardType: RewardType;
  amount: number;
  awardedAt: string;
}

export interface HouseholdSettings {
  celebrationMode: CelebrationMode;
}

export interface PreschoolParticipationState {
  schemaVersion: 1;
  householdRoles: {
    parentAdmins: string[];
  };
  householdSettings: HouseholdSettings;
  childProfiles: ChildProfile[];
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
  rewards: RewardLedgerEntry[];
}
