import type { LegacyParticipationState, PreschoolParticipationState } from "./types.js";

export function createDefaultState(): PreschoolParticipationState {
  return {
    schemaVersion: 1,
    householdRoles: {
      parentAdmins: []
    },
    householdSettings: {
      celebrationMode: "full"
    },
    childProfiles: [],
    routines: [],
    chores: [],
    completions: [],
    rewards: []
  };
}

export function migrateState(raw: LegacyParticipationState): PreschoolParticipationState {
  const base = createDefaultState();

  return {
    schemaVersion: 1,
    householdRoles: {
      parentAdmins: Array.isArray(raw.householdRoles?.parentAdmins)
        ? raw.householdRoles.parentAdmins.filter(
            (value: unknown): value is string => typeof value === "string"
          )
        : base.householdRoles.parentAdmins
    },
    householdSettings: {
      celebrationMode:
        raw.householdSettings?.celebrationMode === "gentle"
          ? "gentle"
          : base.householdSettings.celebrationMode
    },
    childProfiles: Array.isArray(raw.childProfiles) ? raw.childProfiles : base.childProfiles,
    routines: Array.isArray(raw.routines) ? raw.routines : base.routines,
    chores: Array.isArray(raw.chores) ? raw.chores : base.chores,
    completions: Array.isArray(raw.completions) ? raw.completions : base.completions,
    rewards: Array.isArray(raw.rewards) ? raw.rewards : base.rewards
  };
}
