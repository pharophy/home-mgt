import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { fetchJson } from "./app/api";
import { generateInstructionalImage } from "./app/completion-imagery";
import { actorHeaders, initialState, initialTodayPlan } from "./app/constants";
import type {
  ActivityDraft,
  AppRoute,
  AppState,
  CelebrationMode,
  ChildProfile,
  ChildProfileDraft,
  Chore,
  Completion,
  RewardFormValue,
  Routine,
  TabletTask,
  TodayPlan
} from "./app/types";
import {
  buildWeeklyMatrixRows,
  currentDayNumber,
  currentWeekday,
  getActiveChoreTask,
  getActiveRoutineTask,
  getActiveTabletTask,
  toggleDay
} from "./app/view-model";
import { ChildProfilesPage } from "./components/ChildProfilesPage";
import { ChildSelectorPanel } from "./components/ChildSelectorPanel";
import { DashboardPanel } from "./components/DashboardPanel";
import { HistoryPage } from "./components/HistoryPage";
import { ParentWorkspace } from "./components/ParentWorkspace";
import { TabletStage } from "./components/TabletStage";
import { WeeklyMatrix } from "./components/WeeklyMatrix";

type CompletionImageResult = {
  imageUrl: string;
  prompt: string;
  selectedTheme: string;
};

type CelebrationOverlayState =
  | {
      status: "pending";
      activityName: string;
    }
  | {
      status: "imageReady";
      activityName: string;
      imageUrl: string;
    };

type CompletionArtworkState = "pendingImage" | "imageReady" | "imageUnavailable";

const celebrationOverlayDurationMs = 1600;

function emptyChildDraft(color = "#F59E0B"): ChildProfileDraft {
  return {
    editingChildId: null,
    name: "",
    avatarUrl: "",
    color,
    motivatorsText: ""
  };
}

function emptyActivityDraft(): ActivityDraft {
  return {
    editingActivityId: null,
    editingActivityType: null,
    name: "",
    imageUrl: "",
    steps: [
      {
        label: "",
        icon: "",
        imageUrl: ""
      }
    ],
    selectedDays: [],
    requiresApproval: false,
    rewardType: "",
    rewardAmount: ""
  };
}

function completionArtworkKey(childProfileId: string, day: string | undefined, itemId: string): string {
  return `${childProfileId}:${day ?? currentWeekday()}:${itemId}`;
}

function readRouteFromHash(): AppRoute {
  const hash = window.location.hash.replace(/^#/, "");
  if (
    hash === "children" ||
    hash === "activities" ||
    hash === "history" ||
    hash === "tablet"
  ) {
    return hash;
  }

  return "matrix";
}

function removeRelatedCompletions(
  completions: Completion[],
  activityId: string
): { nextCompletions: Completion[]; removedCompletionIds: string[] } {
  const removedCompletionIds = completions
    .filter((entry) => entry.itemId === activityId || entry.parentEntityId === activityId)
    .map((entry) => entry.id);

  return {
    nextCompletions: completions.filter(
      (entry) => entry.itemId !== activityId && entry.parentEntityId !== activityId
    ),
    removedCompletionIds
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [todayPlan, setTodayPlan] = useState<TodayPlan>(initialTodayPlan);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(readRouteFromHash);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const [celebrationMode, setCelebrationMode] = useState<CelebrationMode>("full");
  const [routineProgress, setRoutineProgress] = useState<Record<string, number>>({});
  const [completedChoreIds, setCompletedChoreIds] = useState<string[]>([]);
  const [tabletMessage, setTabletMessage] = useState<string | null>(null);
  const [childDraft, setChildDraft] = useState<ChildProfileDraft>(emptyChildDraft());
  const [activityDraft, setActivityDraft] = useState<ActivityDraft>(emptyActivityDraft());
  const [completionArtwork, setCompletionArtwork] = useState<
    Record<string, { status: CompletionArtworkState; imageUrl?: string }>
  >({});
  const [celebrationOverlay, setCelebrationOverlay] =
    useState<CelebrationOverlayState | null>(null);

  async function loadTodayPlan(childId: string): Promise<void> {
    const plan = await fetchJson<TodayPlan>(
      `/api/today-plan?childProfileId=${childId}&day=${currentWeekday()}`,
      {
        headers: actorHeaders
      }
    );
    setTodayPlan(plan);
  }

  async function loadState(childIdOverride?: string): Promise<void> {
    const nextState = await fetchJson<AppState>("/api/state", {
      headers: actorHeaders
    });

    setState(nextState);
    const resolvedChildId = childIdOverride ?? nextState.childProfiles[0]?.id ?? "";
    setSelectedChildId(resolvedChildId);

    if (resolvedChildId) {
      await loadTodayPlan(resolvedChildId);
      return;
    }

    setTodayPlan(initialTodayPlan);
  }

  useEffect(() => {
    async function load() {
      try {
        await loadState();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setActiveRoute(readRouteFromHash());
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (celebrationOverlay?.status !== "imageReady") {
      return;
    }

    const timer = window.setTimeout(() => {
      setCelebrationOverlay((current) =>
        current?.status === "imageReady" ? null : current
      );
    }, celebrationOverlayDurationMs);

    return () => window.clearTimeout(timer);
  }, [celebrationOverlay]);

  function navigateTo(route: AppRoute): void {
    window.location.hash = route === "matrix" ? "" : route;
    setActiveRoute(route);
  }

  function toRewardDefinition(
    rewardType: RewardFormValue,
    rewardAmount: string
  ): { type: "stars" | "stickers"; amount: number } | undefined {
    const parsedAmount = Number(rewardAmount);
    if (
      (rewardType === "stars" || rewardType === "stickers") &&
      Number.isFinite(parsedAmount) &&
      parsedAmount > 0
    ) {
      return {
        type: rewardType,
        amount: parsedAmount
      };
    }

    return undefined;
  }

  async function handleSubmitChildProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const childProfile = await fetchJson<ChildProfile>(
        childDraft.editingChildId ? `/api/child-profiles/${childDraft.editingChildId}` : "/api/child-profiles",
        {
          method: childDraft.editingChildId ? "PATCH" : "POST",
          headers: {
            ...actorHeaders,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: childDraft.name,
            avatarUrl: childDraft.avatarUrl,
            color: childDraft.color,
            motivators: childDraft.motivatorsText
              .split(",")
              .map((value) => value.trim())
              .filter((value) => value.length > 0)
          })
        }
      );

      setState((current) => ({
        ...current,
        childProfiles: current.childProfiles.some((entry) => entry.id === childProfile.id)
          ? current.childProfiles.map((entry) => (entry.id === childProfile.id ? childProfile : entry))
          : [...current.childProfiles, childProfile]
      }));
      setSelectedChildId(childProfile.id);
      setChildDraft(emptyChildDraft(childDraft.color));

      if (!childDraft.editingChildId) {
        setTodayPlan(initialTodayPlan);
      }

      setSavingMessage(childDraft.editingChildId ? "Child profile updated" : "Ready for today's plan");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save child profile");
    }
  }

  function beginEditChild(child: ChildProfile): void {
    setChildDraft({
      editingChildId: child.id,
      name: child.name,
      avatarUrl: child.avatarUrl ?? "",
      color: child.color,
      motivatorsText: child.motivators.join(", ")
    });
  }

  async function handleDeleteChildProfile(child: ChildProfile): Promise<void> {
    setError(null);

    try {
      await fetchJson<void>(`/api/child-profiles/${child.id}`, {
        method: "DELETE",
        headers: actorHeaders
      });

      const nextChildren = state.childProfiles.filter((entry) => entry.id !== child.id);
      const nextSelectedChildId =
        selectedChildId === child.id ? nextChildren[0]?.id ?? "" : selectedChildId;

      setState((current) => ({
        ...current,
        childProfiles: current.childProfiles.filter((entry) => entry.id !== child.id),
        routines: current.routines.filter((entry) => entry.childProfileId !== child.id),
        chores: current.chores.filter((entry) => entry.childProfileId !== child.id),
        completions: current.completions.filter((entry) => entry.childProfileId !== child.id),
        rewards: current.rewards.filter((entry) => entry.childProfileId !== child.id),
        pendingApprovals: current.pendingApprovals.filter(
          (entry) => entry.childProfileId !== child.id
        )
      }));
      setSelectedChildId(nextSelectedChildId);
      setChildDraft((current) =>
        current.editingChildId === child.id ? emptyChildDraft(current.color) : current
      );

      if (nextSelectedChildId) {
        await loadTodayPlan(nextSelectedChildId);
      } else {
        setTodayPlan(initialTodayPlan);
      }

      setSavingMessage("Child profile deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete child profile");
    }
  }

  async function handleCreateActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChildId) {
      return;
    }

    setError(null);

    const trimmedName = activityDraft.name.trim();
    if (!trimmedName) {
      setError("Enter an activity name before saving this task.");
      return;
    }

    if (activityDraft.selectedDays.length === 0) {
      setError("Select at least one scheduled day before saving this activity.");
      return;
    }

    try {
      const reward = toRewardDefinition(activityDraft.rewardType, activityDraft.rewardAmount);
      const steps = activityDraft.steps
        .map((step) => ({
          label: step.label.trim(),
          icon: step.icon.trim(),
          imageUrl: step.imageUrl.trim()
        }))
        .filter((step) => step.label || step.icon || step.imageUrl);
      const isStepBased = steps.length > 0;
      const shouldSaveRoutine =
        activityDraft.editingActivityType === "routine" ||
        (activityDraft.editingActivityType === null && isStepBased);

      if (shouldSaveRoutine) {
        const routine = await fetchJson<Routine>(
          activityDraft.editingActivityType === "routine" && activityDraft.editingActivityId
            ? `/api/routines/${activityDraft.editingActivityId}`
            : "/api/routines",
          {
            method:
              activityDraft.editingActivityType === "routine" && activityDraft.editingActivityId
                ? "PATCH"
                : "POST",
            headers: {
              ...actorHeaders,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...(activityDraft.editingActivityType === "routine" && activityDraft.editingActivityId
                ? {}
                : { childProfileId: selectedChildId }),
              name: trimmedName,
              imageUrl: activityDraft.imageUrl || undefined,
              schedule: {
                days: activityDraft.selectedDays
              },
              steps,
              reward
            })
          }
        );

        setState((current) => ({
          ...current,
          routines: current.routines.some((entry) => entry.id === routine.id)
            ? current.routines.map((entry) => (entry.id === routine.id ? routine : entry))
            : [...current.routines, routine]
        }));

        setTodayPlan((current) => {
          const matchingDay = routine.schedule.days.includes(current.day);
          const filteredRoutines = current.routines.filter((entry) => entry.id !== routine.id);
          return {
            ...current,
            routines: matchingDay ? [...filteredRoutines, routine] : filteredRoutines
          };
        });
      } else {
        const chore = await fetchJson<Chore>(
          activityDraft.editingActivityType === "chore" && activityDraft.editingActivityId
            ? `/api/chores/${activityDraft.editingActivityId}`
            : "/api/chores",
          {
            method:
              activityDraft.editingActivityType === "chore" && activityDraft.editingActivityId
                ? "PATCH"
                : "POST",
            headers: {
              ...actorHeaders,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              ...(activityDraft.editingActivityType === "chore" && activityDraft.editingActivityId
                ? {}
                : { childProfileId: selectedChildId }),
              name: trimmedName,
              imageUrl: activityDraft.imageUrl || undefined,
              recurrence: {
                days: activityDraft.selectedDays
              },
              requiresApproval: activityDraft.requiresApproval,
              reward
            })
          }
        );

        setState((current) => ({
          ...current,
          chores: current.chores.some((entry) => entry.id === chore.id)
            ? current.chores.map((entry) => (entry.id === chore.id ? chore : entry))
            : [...current.chores, chore]
        }));

        setTodayPlan((current) => {
          const matchingDay = chore.recurrence.days.includes(current.day);
          const filteredChores = current.chores.filter((entry) => entry.id !== chore.id);
          return {
            ...current,
            chores: matchingDay ? [...filteredChores, chore] : filteredChores
          };
        });
      }

      setActivityDraft(emptyActivityDraft());
      setSavingMessage(activityDraft.editingActivityId ? "Activity updated" : "Activity saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save activity");
    }
  }

  async function handleSelectChild(childId: string): Promise<void> {
    setSelectedChildId(childId);
    setRoutineProgress({});
    setCompletedChoreIds([]);
    setTabletMessage(null);

    try {
      await loadTodayPlan(childId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load today's plan");
    }
  }

  function handleEditRoutine(routine: Routine): void {
    setActivityDraft({
      editingActivityId: routine.id,
      editingActivityType: "routine",
      name: routine.name,
      imageUrl: routine.imageUrl ?? "",
      steps: routine.steps.map((step) => ({
        label: step.label,
        icon: step.icon ?? "",
        imageUrl: step.imageUrl ?? ""
      })),
      selectedDays: routine.schedule.days,
      requiresApproval: false,
      rewardType: routine.reward?.type ?? "",
      rewardAmount: routine.reward ? String(routine.reward.amount) : ""
    });
    navigateTo("activities");
  }

  function handleEditChore(chore: Chore): void {
    setActivityDraft({
      editingActivityId: chore.id,
      editingActivityType: "chore",
      name: chore.name,
      imageUrl: chore.imageUrl ?? "",
      steps: [
        {
          label: "",
          icon: "",
          imageUrl: ""
        }
      ],
      selectedDays: chore.recurrence.days,
      requiresApproval: chore.requiresApproval,
      rewardType: chore.reward?.type ?? "",
      rewardAmount: chore.reward ? String(chore.reward.amount) : ""
    });
  }

  async function handleDeleteActivity(activity: {
    id: string;
    type: "routine" | "chore";
  }): Promise<void> {
    setError(null);

    try {
      await fetchJson<void>(
        activity.type === "routine" ? `/api/routines/${activity.id}` : `/api/chores/${activity.id}`,
        {
          method: "DELETE",
          headers: actorHeaders
        }
      );

      const { removedCompletionIds } = removeRelatedCompletions(state.completions, activity.id);
      const removedCompletionIdSet = new Set(removedCompletionIds);

      setState((current) => {
        const related = removeRelatedCompletions(current.completions, activity.id);
        return {
          ...current,
          routines:
            activity.type === "routine"
              ? current.routines.filter((entry) => entry.id !== activity.id)
              : current.routines,
          chores:
            activity.type === "chore"
              ? current.chores.filter((entry) => entry.id !== activity.id)
              : current.chores,
          completions: related.nextCompletions,
          rewards: current.rewards.filter(
            (reward) => !removedCompletionIdSet.has(reward.completionId)
          ),
          pendingApprovals: current.pendingApprovals.filter(
            (entry) => entry.itemId !== activity.id && entry.parentEntityId !== activity.id
          )
        };
      });
      setTodayPlan((current) => ({
        ...current,
        routines:
          activity.type === "routine"
            ? current.routines.filter((entry) => entry.id !== activity.id)
            : current.routines,
        chores:
          activity.type === "chore"
            ? current.chores.filter((entry) => entry.id !== activity.id)
            : current.chores,
        pendingApprovals: current.pendingApprovals.filter(
          (entry) => entry.itemId !== activity.id && entry.parentEntityId !== activity.id
        )
      }));
      setActivityDraft((current) =>
        current.editingActivityId === activity.id ? emptyActivityDraft() : current
      );
      setSavingMessage("Activity deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete activity");
    }
  }

  async function handleGenerateInstructionalImage(): Promise<void> {
    try {
      const result = await generateInstructionalImage({
        activityName: activityDraft.name,
        stepLabels: activityDraft.steps.map((step) => step.label)
      });

      setActivityDraft((current) => ({
        ...current,
        imageUrl: result.imageUrl
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate instructional image");
    }
  }

  const selectedChild =
    state.childProfiles.find((child) => child.id === selectedChildId) ?? null;

  const todayRoutines = Array.isArray(todayPlan.routines) ? todayPlan.routines : [];
  const todayChores = Array.isArray(todayPlan.chores) ? todayPlan.chores : [];
  const todayPendingApprovals = Array.isArray(todayPlan.pendingApprovals)
    ? todayPlan.pendingApprovals
    : [];

  const routineCompletionIds = new Set(
    state.completions
      .filter(
        (completion) =>
          completion.childProfileId === selectedChildId &&
          (!completion.scheduledDay || completion.scheduledDay === todayPlan.day) &&
          (completion.status === "completed" || completion.status === "approved")
      )
      .map((completion) => completion.itemId)
  );

  const completedRoutineNames = todayRoutines
    .filter(
      (routine) =>
        routineCompletionIds.has(routine.id) ||
        (Array.isArray(routine.steps) &&
          routine.steps.length > 0 &&
          routine.steps.every((step) => routineCompletionIds.has(step.id)))
    )
    .map((routine) => routine.name);

  const reviewItemNames = todayPendingApprovals
    .map((completion) => {
      const pendingChore = todayChores.find((chore) => chore.id === completion.itemId);
      return pendingChore?.name;
    })
    .filter((value): value is string => typeof value === "string");

  const completedChoreNames = todayChores
    .filter(
      (chore) =>
        routineCompletionIds.has(chore.id) &&
        !todayPendingApprovals.some((completion) => completion.itemId === chore.id)
    )
    .map((chore) => chore.name);

  const completedItems = [...completedRoutineNames, ...completedChoreNames];
  const incompleteItems = [
    ...todayRoutines
      .filter((routine) => !completedRoutineNames.includes(routine.name))
      .map((routine) => routine.name),
    ...todayChores
      .filter((chore) => !completedChoreNames.includes(chore.name))
      .map((chore) => chore.name)
  ];

  const activeRoutineTask = getActiveRoutineTask(todayRoutines, routineProgress);
  const activeChoreTask = getActiveChoreTask(todayChores, completedChoreIds);
  const activeTabletTask: TabletTask | null = getActiveTabletTask(activeRoutineTask, activeChoreTask);

  const weeklyMatrixRows = selectedChildId
    ? buildWeeklyMatrixRows({
        childProfileId: selectedChildId,
        routines: state.routines,
        chores: state.chores,
        completions: state.completions,
        currentDay: currentWeekday()
      })
    : [];

  const persistedCompletionArtwork = Object.fromEntries(
    state.completions
      .filter((completion) => Boolean(completion.celebrationImageUrl))
      .map((completion) => [
        completionArtworkKey(completion.childProfileId, completion.scheduledDay, completion.itemId),
        {
          status: "imageReady" as const,
          imageUrl: completion.celebrationImageUrl
        }
      ])
  );

  const weeklyMatrixArtwork = {
    ...persistedCompletionArtwork,
    ...completionArtwork
  };

  async function handleCompleteRoutineStep(task: Extract<TabletTask, { kind: "routineStep" }>) {
    setError(null);

    try {
      const completion = await fetchJson<Completion>("/api/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-role": "childDisplay",
          "x-actor-id": "tablet-1"
        },
        body: JSON.stringify({
          itemType: "routineStep",
          itemId: task.step.id,
          childProfileId: selectedChildId,
          scheduledDay: todayPlan.day,
          parentEntityType: "routine",
          parentEntityId: task.routine.id
        })
      });

      const nextStepIndex = task.stepIndex + 1;
      const isFinished = nextStepIndex >= task.routine.steps.length;
      setState((current) => ({
        ...current,
        completions: [...current.completions, completion]
      }));
      setRoutineProgress((current) => ({
        ...current,
        [task.routine.id]: nextStepIndex
      }));
      setTabletMessage(isFinished ? `${task.routine.name} complete` : `${task.step.label} complete`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record progress");
    }
  }

  async function handleCompleteChore(task: Extract<TabletTask, { kind: "chore" }>) {
    setError(null);

    try {
      const completion = await fetchJson<Completion>("/api/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-role": "childDisplay",
          "x-actor-id": "tablet-1"
        },
        body: JSON.stringify({
          itemType: "chore",
          itemId: task.chore.id,
          childProfileId: selectedChildId,
          scheduledDay: todayPlan.day
        })
      });

      setCompletedChoreIds((current) => [...current, task.chore.id]);
      setState((current) => ({
        ...current,
        completions: [...current.completions, completion],
        pendingApprovals:
          completion.status === "pendingApproval"
            ? [...current.pendingApprovals, completion]
            : current.pendingApprovals
      }));
      if (completion.status === "pendingApproval") {
        setTodayPlan((current) => ({
          ...current,
          pendingApprovals: [...current.pendingApprovals, completion]
        }));
        setTabletMessage("Waiting for parent check");
        return;
      }

      setTabletMessage(`${task.chore.name} complete`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to record chore");
    }
  }

  async function handleToggleMatrixCell(row: (typeof weeklyMatrixRows)[number]): Promise<void> {
    const today = currentWeekday();
    const todayCell = row.cells.find((cell) => cell.day === today);
    if (!todayCell?.interactive) {
      return;
    }

    const artworkKey = completionArtworkKey(row.childProfileId, today, row.id);
    setError(null);

    if (todayCell.completed && todayCell.completionId) {
      try {
        await fetchJson<void>(`/api/completions/${todayCell.completionId}`, {
          method: "DELETE",
          headers: actorHeaders
        });

        setState((current) => ({
          ...current,
          completions: current.completions.filter((entry) => entry.id !== todayCell.completionId),
          rewards: current.rewards.filter((reward) => reward.id !== todayCell.completionId)
        }));
        setCompletionArtwork((current) => {
          const next = { ...current };
          delete next[artworkKey];
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to unmark completion");
      }

      return;
    }

    try {
      const completion = await fetchJson<Completion>("/api/completions", {
        method: "POST",
        headers: {
          ...actorHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemType: row.itemType,
          itemId: row.itemId,
          childProfileId: row.childProfileId,
          scheduledDay: today,
          parentEntityType: row.itemType === "routine" ? "routine" : undefined,
          parentEntityId: row.itemType === "routine" ? row.itemId : undefined
        })
      });

      setState((current) => ({
        ...current,
        completions: [...current.completions, completion]
      }));
      setCompletionArtwork((current) => ({
        ...current,
        [artworkKey]: {
          status: "pendingImage"
        }
      }));
      setCelebrationOverlay({
        status: "pending",
        activityName: row.name
      });

      const child = state.childProfiles.find((entry) => entry.id === row.childProfileId);
      if (!child) {
        setCelebrationOverlay(null);
        return;
      }

      void fetchJson<CompletionImageResult>("/api/completion-images", {
        method: "POST",
        headers: {
          ...actorHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completionId: completion.id,
          childName: child.name,
          activityName: row.name,
          interestThemes: child.motivators,
          celebrationMode,
          variantSeed: state.completions.length + 1
        })
      })
        .then((result) => {
          setState((current) => ({
            ...current,
            completions: current.completions.map((entry) =>
              entry.id === completion.id
                ? {
                    ...entry,
                    celebrationImageUrl: result.imageUrl,
                    celebrationPrompt: result.prompt,
                    celebrationTheme: result.selectedTheme,
                    celebrationGeneratedAt: new Date().toISOString()
                  }
                : entry
            )
          }));
          setCompletionArtwork((current) => {
            if (!current[artworkKey]) {
              return current;
            }

            return {
              ...current,
              [artworkKey]: {
                status: "imageReady",
                imageUrl: result.imageUrl
              }
            };
          });
          setCelebrationOverlay({
            status: "imageReady",
            activityName: row.name,
            imageUrl: result.imageUrl
          });
        })
        .catch(() => {
          setCompletionArtwork((current) => {
            if (!current[artworkKey]) {
              return current;
            }

            return {
              ...current,
              [artworkKey]: {
                status: "imageUnavailable"
              }
            };
          });
          setCelebrationOverlay(null);
        });
    } catch (err) {
      setCelebrationOverlay(null);
      setError(err instanceof Error ? err.message : "Unable to record completion");
    }
  }

  const stickerHistoryCount = state.completions.filter((entry) => Boolean(entry.celebrationImageUrl)).length;

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Preschool Participation MVP</p>
          <h1>Build a calm, visual plan for today.</h1>
          <p className="lede">
            Keep profiles, activities, the weekly matrix, and saved sticker history in
            one clear parent workflow.
          </p>
        </div>
        <div className="hero-summary">
          <div>
            <span>Children</span>
            <strong>{state.childProfiles.length}</strong>
          </div>
          <div>
            <span>Pending approvals</span>
            <strong>{state.pendingApprovals.length}</strong>
          </div>
          <div>
            <span>Saved stickers</span>
            <strong>{stickerHistoryCount}</strong>
          </div>
        </div>
      </section>

      {error ? <p className="feedback error">{error}</p> : null}
      {savingMessage ? <p className="feedback success">{savingMessage}</p> : null}

      <nav className="mode-switch panel" aria-label="Top-level navigation">
        <button type="button" aria-pressed={activeRoute === "children"} onClick={() => navigateTo("children")}>
          Children
        </button>
        <button type="button" aria-pressed={activeRoute === "matrix"} onClick={() => navigateTo("matrix")}>
          Matrix
        </button>
        <button type="button" aria-pressed={activeRoute === "activities"} onClick={() => navigateTo("activities")}>
          Activities
        </button>
        <button type="button" aria-pressed={activeRoute === "history"} onClick={() => navigateTo("history")}>
          History
        </button>
        <button type="button" aria-pressed={activeRoute === "tablet"} onClick={() => navigateTo("tablet")}>
          Tablet
        </button>
      </nav>

      {activeRoute === "children" ? (
        <ChildProfilesPage
          childDraft={childDraft}
          childProfiles={state.childProfiles}
          selectedChildId={selectedChildId}
          onChildDraftChange={(updater) => setChildDraft((current) => updater(current))}
          onSubmit={handleSubmitChildProfile}
          onEditChild={beginEditChild}
          onDeleteChild={(child) => void handleDeleteChildProfile(child)}
          onSelectChild={(childId) => void handleSelectChild(childId)}
          onCancelEdit={() => setChildDraft((current) => emptyChildDraft(current.color))}
        />
      ) : null}

      {activeRoute === "matrix" ? (
        <section className="workspace-grid">
          <ChildSelectorPanel
            childProfiles={state.childProfiles}
            selectedChildId={selectedChildId}
            title="Pick the active child"
            description="Choose which child to view in the weekly completion matrix."
            onSelectChild={(childId) => void handleSelectChild(childId)}
          />
          <WeeklyMatrix
            rows={weeklyMatrixRows}
            currentDay={currentWeekday()}
            currentDayNumber={currentDayNumber()}
            artwork={weeklyMatrixArtwork}
            onToggleCell={(row) => void handleToggleMatrixCell(row)}
          />
          <DashboardPanel
            loading={loading}
            selectedChild={selectedChild}
            pendingApprovalCount={state.pendingApprovals.length}
            rewards={state.rewards}
            completedItems={completedItems}
            incompleteItems={incompleteItems}
            reviewItems={reviewItemNames}
          />
        </section>
      ) : null}

      {activeRoute === "activities" ? (
        <section className="workspace-grid">
          <ChildSelectorPanel
            childProfiles={state.childProfiles}
            selectedChildId={selectedChildId}
            title="Plan activities"
            description="Select a child, then create or edit routines and single-action activities."
            onSelectChild={(childId) => void handleSelectChild(childId)}
          />
          <ParentWorkspace
            activityDraft={activityDraft}
            selectedChildId={selectedChildId}
            routines={state.routines}
            chores={state.chores}
            onActivityDraftChange={setActivityDraft}
            onCreateActivity={handleCreateActivity}
            onGenerateInstructionalImage={() => void handleGenerateInstructionalImage()}
            onEditRoutine={handleEditRoutine}
            onEditChore={handleEditChore}
            onDeleteActivity={(activity) => void handleDeleteActivity(activity)}
            onAddActivityStep={() =>
              setActivityDraft((current) => ({
                ...current,
                steps: [
                  ...current.steps,
                  {
                    label: "",
                    icon: "",
                    imageUrl: ""
                  }
                ]
              }))
            }
            onUpdateActivityStep={(stepIndex, field, value) =>
              setActivityDraft((current) => ({
                ...current,
                steps: current.steps.map((step, index) =>
                  index === stepIndex
                    ? {
                        ...step,
                        [field]: value
                      }
                    : step
                )
              }))
            }
            onToggleActivityDay={(day) =>
              setActivityDraft((current) => ({
                ...current,
                selectedDays: toggleDay(current.selectedDays, day)
              }))
            }
          />
        </section>
      ) : null}

      {activeRoute === "history" ? (
        <HistoryPage
          childProfiles={state.childProfiles}
          routines={state.routines}
          chores={state.chores}
          completions={state.completions}
        />
      ) : null}

      {activeRoute === "tablet" ? (
        <section className="workspace-grid">
          <article className="panel">
            <header className="panel-header">
              <div>
                <p className="section-kicker">Tablet</p>
                <h2>Child-safe execution</h2>
              </div>
            </header>
            <label className="checkbox-inline">
              <input
                type="checkbox"
                aria-label="Gentle celebration mode"
                checked={celebrationMode === "gentle"}
                onChange={(event) =>
                  setCelebrationMode(event.target.checked ? "gentle" : "full")
                }
              />
              <span>Gentle celebration mode</span>
            </label>
          </article>
          <TabletStage
            selectedChild={selectedChild}
            activeTabletTask={activeTabletTask}
            celebrationMode={celebrationMode}
            tabletMessage={tabletMessage}
            onCompleteRoutineStep={(task) => void handleCompleteRoutineStep(task)}
            onCompleteChore={(task) => void handleCompleteChore(task)}
          />
        </section>
      ) : null}

      {celebrationOverlay ? (
        <div
          className={`celebration-overlay ${
            celebrationOverlay.status === "imageReady" ? "is-ready" : "is-pending"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label={`Celebration for ${celebrationOverlay.activityName}`}
        >
          <div className="celebration-overlay-backdrop" />
          <div className="celebration-overlay-card">
            <div className="celebration-starburst" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            {celebrationOverlay.status === "pending" ? (
              <>
                <div className="celebration-loading-orb" aria-hidden="true" />
                <p className="celebration-overlay-copy">Creating sticker...</p>
              </>
            ) : (
              <img
                className="celebration-overlay-image completion-reveal"
                src={celebrationOverlay.imageUrl}
                alt={`Celebration spotlight for ${celebrationOverlay.activityName}`}
              />
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
