import type { CSSProperties } from "react";

import type {
  ChildProfile as SharedChildProfile,
  Chore as SharedChore,
  Completion as SharedCompletion,
  HouseholdSettings,
  RewardType,
  RewardLedgerEntry,
  Routine as SharedRoutine,
  RoutineStep as SharedRoutineStep,
  Weekday
} from "@shared/preschool";

export type { CelebrationMode, Weekday } from "@shared/preschool";

export type AppRoute = "setup" | "matrix" | "history";

export type ChildProfile = Pick<
  SharedChildProfile,
  "id" | "name" | "avatarUrl" | "color" | "motivators" | "createdAt" | "updatedAt"
>;

export type RoutineStep = Pick<
  SharedRoutineStep,
  "id" | "label" | "icon" | "imageUrl" | "order"
>;

export type Routine = Pick<
  SharedRoutine,
  "id" | "name" | "imageUrl" | "childProfileId" | "schedule" | "reward"
> & {
  steps: RoutineStep[];
};

export type Chore = Pick<
  SharedChore,
  "id" | "name" | "imageUrl" | "childProfileId" | "recurrence" | "requiresApproval" | "reward"
>;

export type Completion = Pick<
  SharedCompletion,
  | "id"
  | "itemId"
  | "itemType"
  | "childProfileId"
  | "scheduledDay"
  | "parentEntityType"
  | "parentEntityId"
  | "status"
  | "celebrationImageUrl"
  | "celebrationPrompt"
  | "celebrationTheme"
  | "celebrationGeneratedAt"
  | "completedAt"
>;

export type Reward = Pick<
  RewardLedgerEntry,
  "id" | "amount" | "rewardType" | "childProfileId" | "sourceId" | "completionId"
>;

export type AppState = {
  schemaVersion: number;
  householdSettings?: HouseholdSettings;
  childProfiles: ChildProfile[];
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
  rewards: Reward[];
  pendingApprovals: Completion[];
};

export type TodayPlan = {
  day: Weekday;
  routines: Routine[];
  chores: Chore[];
  pendingApprovals: Completion[];
};

export type ChildProfileDraft = {
  editingChildId: string | null;
  name: string;
  avatarUrl: string;
  color: string;
  motivatorsText: string;
};

export type ActivityDraft = {
  editingActivityId: string | null;
  editingActivityType: "routine" | "chore" | null;
  name: string;
  imageUrl: string;
  requiresApproval: boolean;
  rewardAmount: string;
  rewardType: RewardType | "";
  steps: Array<{
    label: string;
    icon: string;
    imageUrl: string;
  }>;
  selectedDays: Weekday[];
};

export type SetupSection = "children" | "activities";

export type WeekDayOption = {
  value: Weekday;
  label: string;
};

export type ChildChipStyle = CSSProperties;

export type WeeklyMatrixCell = {
  day: Weekday;
  scheduled: boolean;
  interactive: boolean;
  completed: boolean;
  completionId?: string;
};

export type TabletRoutineTask = {
  kind: "routineStep";
  routine: Routine;
  step: RoutineStep;
  stepIndex: number;
};

export type TabletChoreTask = {
  kind: "chore";
  chore: Chore;
};

export type TabletTask = TabletRoutineTask | TabletChoreTask;

export type WeeklyMatrixRow = {
  id: string;
  name: string;
  itemType: "routine" | "chore";
  itemId: string;
  childProfileId: string;
  rewardType: RewardType | null;
  imageUrl: string | null;
  steps: Array<{
    id: string;
    label: string;
    imageUrl: string | null;
  }>;
  cells: WeeklyMatrixCell[];
};
