import type {
  AppState,
  TodayPlan,
  WeekDayOption
} from "./types";

export const actorHeaders = {
  "x-actor-role": "parentAdmin",
  "x-actor-id": "parent-1"
};

export const weekDays: WeekDayOption[] = [
  { value: "sunday", label: "Sunday" },
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" }
];

export const initialState: AppState = {
  schemaVersion: 1,
  householdSettings: {
    celebrationMode: "full"
  },
  childProfiles: [],
  routines: [],
  chores: [],
  completions: [],
  rewards: [],
  pendingApprovals: []
};

export const initialTodayPlan: TodayPlan = {
  day: "sunday",
  routines: [],
  chores: [],
  pendingApprovals: []
};
