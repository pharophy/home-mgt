import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
  InstructionalImageState,
  Routine,
  SetupSection,
  TodayPlan,
  Weekday
} from "./app/types";
import {
  buildWeeklyMatrixRows,
  currentWeekday,
  isCompletionInVisibleWeek,
  toggleDay
} from "./app/view-model";
import { HistoryPage } from "./components/HistoryPage";
import { SetupWorkspace } from "./components/SetupWorkspace";
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

type StickerSpotlightState = {
  activityName: string;
  day: Weekday;
  imageUrl: string;
};

type CompletionArtworkState = "pendingImage" | "imageReady" | "imageUnavailable";
type ActivityDraftImageState = {
  activity: InstructionalImageState;
  steps: Record<number, InstructionalImageState>;
};

const celebrationOverlayDurationMs = 1600;

function emptyActivityDraftImageState(): ActivityDraftImageState {
  return {
    activity: "idle",
    steps: {}
  };
}

function activityImageStatusKey(type: "routine" | "chore", id: string): string {
  return `${type}:${id}`;
}

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
    requiresApproval: false,
    rewardAmount: "",
    rewardType: "",
    steps: [],
    selectedDays: []
  };
}

function readSetupSectionFromHash(): SetupSection {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "activities" ? "activities" : "children";
}

function completionArtworkKey(childProfileId: string, day: string | undefined, itemId: string): string {
  return `${childProfileId}:${day ?? currentWeekday()}:${itemId}`;
}

function hasGeneratedInstructionalImage(imageUrl: string | null | undefined): boolean {
  return (
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("data:image/") ||
      imageUrl.startsWith("/generated-assets/") ||
      imageUrl.startsWith("/api/routines/") ||
      imageUrl.startsWith("/api/chores/"))
  );
}

function readRouteFromHash(): AppRoute {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash === "history") {
    return hash;
  }

  if (hash === "setup" || hash === "children" || hash === "activities") {
    return "setup";
  }

  return "matrix";
}

function buildWeekDayNumbers(now = new Date()): Record<Weekday, number> {
  const sundayStart = new Date(now);
  sundayStart.setDate(sundayStart.getDate() - sundayStart.getDay());

  return {
    sunday: sundayStart.getDate(),
    monday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 1).getDate(),
    tuesday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 2).getDate(),
    wednesday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 3).getDate(),
    thursday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 4).getDate(),
    friday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 5).getDate(),
    saturday: new Date(sundayStart.getFullYear(), sundayStart.getMonth(), sundayStart.getDate() + 6).getDate()
  };
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
  const [, setTodayPlan] = useState<TodayPlan>(initialTodayPlan);
  const [activeRoute, setActiveRoute] = useState<AppRoute>(readRouteFromHash);
  const [setupSection, setSetupSection] = useState<SetupSection>(readSetupSectionFromHash);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingMessage, setSavingMessage] = useState<string | null>(null);
  const [celebrationMode] = useState<CelebrationMode>("full");
  const [childDraft, setChildDraft] = useState<ChildProfileDraft>(emptyChildDraft());
  const [activityDraft, setActivityDraft] = useState<ActivityDraft>(emptyActivityDraft());
  const [activityDraftImageState, setActivityDraftImageState] = useState<ActivityDraftImageState>(
    emptyActivityDraftImageState()
  );
  const [savedActivityImageState, setSavedActivityImageState] = useState<
    Record<string, InstructionalImageState>
  >({});
  const [lastInstructionalPreviewName, setLastInstructionalPreviewName] = useState("");
  const [childEditorOpen, setChildEditorOpen] = useState(false);
  const [activityEditorOpen, setActivityEditorOpen] = useState(false);
  const [completionArtwork, setCompletionArtwork] = useState<
    Record<string, { status: CompletionArtworkState; imageUrl?: string }>
  >({});
  const [celebrationOverlay, setCelebrationOverlay] =
    useState<CelebrationOverlayState | null>(null);
  const [stickerSpotlight, setStickerSpotlight] = useState<StickerSpotlightState | null>(null);
  const pendingInstructionalBackfillKeys = useRef(new Set<string>());
  const pendingDraftPreviewKeys = useRef(new Set<string>());
  const pendingCompletionKeys = useRef(new Set<string>());
  const shouldBackfillInstructionalImages =
    import.meta.env.MODE !== "test" ||
    Boolean((window as Window & { __enableInstructionalBackfill__?: boolean }).__enableInstructionalBackfill__);

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
      }
    }

    void load();
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setActiveRoute(readRouteFromHash());
      setSetupSection(readSetupSectionFromHash());
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
    if (route === "setup") {
      window.location.hash = setupSection;
      setActiveRoute("setup");
      return;
    }

    window.location.hash = route === "matrix" ? "" : route;
    setActiveRoute(route);
  }

  function openSetupSection(section: SetupSection): void {
    setSetupSection(section);
    window.location.hash = section;
    setActiveRoute("setup");
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
      setChildEditorOpen(false);

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
    setChildEditorOpen(true);
    openSetupSection("children");
  }

  function startCreateChild(): void {
    setChildDraft((current) => emptyChildDraft(current.color));
    setChildEditorOpen(true);
    openSetupSection("children");
  }

  function cancelChildEditor(): void {
    setChildDraft((current) => emptyChildDraft(current.color));
    setChildEditorOpen(false);
  }

  function syncActivityDraftImageState(draft: ActivityDraft): void {
    setActivityDraftImageState({
      activity: draft.imageUrl ? "ready" : "idle",
      steps: Object.fromEntries(
        draft.steps.map((step, index) => [index, step.imageUrl ? "ready" : "idle"])
      )
    });
  }

  function markSavedActivityImageState(
    type: "routine" | "chore",
    id: string,
    status: InstructionalImageState
  ): void {
    setSavedActivityImageState((current) => ({
      ...current,
      [activityImageStatusKey(type, id)]: status
    }));
  }

  function clearSavedActivityImageState(type: "routine" | "chore", id: string): void {
    setSavedActivityImageState((current) => {
      const next = { ...current };
      delete next[activityImageStatusKey(type, id)];
      return next;
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
      if (childDraft.editingChildId === child.id) {
        setChildEditorOpen(false);
      }

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
      const activityImageUrl =
        activityDraft.imageUrl.trim().length > 0 &&
        hasGeneratedInstructionalImage(activityDraft.imageUrl)
          ? activityDraft.imageUrl.trim()
          : undefined;
      const existingReward =
        activityDraft.editingActivityType === "routine"
          ? state.routines.find((entry) => entry.id === activityDraft.editingActivityId)?.reward
          : activityDraft.editingActivityType === "chore"
            ? state.chores.find((entry) => entry.id === activityDraft.editingActivityId)?.reward
            : undefined;
      const reward = activityDraft.editingActivityId ? existingReward : undefined;
      const existingRequiresApproval =
        activityDraft.editingActivityType === "chore"
          ? state.chores.find((entry) => entry.id === activityDraft.editingActivityId)
              ?.requiresApproval
          : undefined;
      const requiresApproval =
        activityDraft.editingActivityType === "chore"
          ? existingRequiresApproval ?? false
          : false;
      const steps = activityDraft.steps
        .map((step) => ({
          label: step.label.trim(),
          icon: "",
          imageUrl:
            step.imageUrl.trim().length > 0 && hasGeneratedInstructionalImage(step.imageUrl)
              ? step.imageUrl.trim()
              : undefined
        }))
        .filter((step) => step.label);
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
              ...(activityImageUrl ? { imageUrl: activityImageUrl } : {}),
              schedule: {
                days: activityDraft.selectedDays
              },
              steps,
              ...(reward ? { reward } : {})
            })
          }
        );

        setState((current) => ({
          ...current,
          routines: current.routines.some((entry) => entry.id === routine.id)
            ? current.routines.map((entry) => (entry.id === routine.id ? routine : entry))
            : [...current.routines, routine]
        }));
        if (!routine.imageUrl || routine.steps.some((step) => !step.imageUrl)) {
          markSavedActivityImageState("routine", routine.id, "pending");
        } else {
          clearSavedActivityImageState("routine", routine.id);
        }

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
              ...(activityImageUrl ? { imageUrl: activityImageUrl } : {}),
              recurrence: {
                days: activityDraft.selectedDays
              },
              requiresApproval,
              ...(reward ? { reward } : {})
            })
          }
        );

        setState((current) => ({
          ...current,
          chores: current.chores.some((entry) => entry.id === chore.id)
            ? current.chores.map((entry) => (entry.id === chore.id ? chore : entry))
            : [...current.chores, chore]
        }));
        if (!chore.imageUrl) {
          markSavedActivityImageState("chore", chore.id, "pending");
        } else {
          clearSavedActivityImageState("chore", chore.id);
        }

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
      setActivityDraftImageState(emptyActivityDraftImageState());
      setLastInstructionalPreviewName("");
      setActivityEditorOpen(false);
      setSavingMessage(activityDraft.editingActivityId ? "Activity updated" : "Activity saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save activity");
    }
  }

  async function handleSelectChild(childId: string): Promise<void> {
    setSelectedChildId(childId);

    try {
      await loadTodayPlan(childId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load today's plan");
    }
  }

  function handleEditRoutine(routine: Routine): void {
    const nextDraft: ActivityDraft = {
      editingActivityId: routine.id,
      editingActivityType: "routine",
      name: routine.name,
      imageUrl: routine.imageUrl ?? "",
      requiresApproval: false,
      rewardAmount: routine.reward ? String(routine.reward.amount) : "",
      rewardType: routine.reward?.type ?? "",
      steps: routine.steps.map((step) => ({
        label: step.label,
        icon: "",
        imageUrl: step.imageUrl ?? ""
      })),
      selectedDays: routine.schedule.days
    };
    setActivityDraft(nextDraft);
    syncActivityDraftImageState(nextDraft);
    setActivityEditorOpen(true);
    setLastInstructionalPreviewName("");
    openSetupSection("activities");
  }

  function handleEditChore(chore: Chore): void {
    const nextDraft: ActivityDraft = {
      editingActivityId: chore.id,
      editingActivityType: "chore",
      name: chore.name,
      imageUrl: chore.imageUrl ?? "",
      requiresApproval: chore.requiresApproval,
      rewardAmount: chore.reward ? String(chore.reward.amount) : "",
      rewardType: chore.reward?.type ?? "",
      steps: [],
      selectedDays: chore.recurrence.days
    };
    setActivityDraft(nextDraft);
    syncActivityDraftImageState(nextDraft);
    setActivityEditorOpen(true);
    setLastInstructionalPreviewName("");
    openSetupSection("activities");
  }

  function startCreateActivity(): void {
    setActivityDraft(emptyActivityDraft());
    setActivityDraftImageState(emptyActivityDraftImageState());
    setLastInstructionalPreviewName("");
    setActivityEditorOpen(true);
    openSetupSection("activities");
  }

  function cancelActivityEditor(): void {
    setActivityDraft(emptyActivityDraft());
    setActivityDraftImageState(emptyActivityDraftImageState());
    setLastInstructionalPreviewName("");
    setActivityEditorOpen(false);
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
      clearSavedActivityImageState(activity.type, activity.id);
      setActivityEditorOpen((current) =>
        activityDraft.editingActivityId === activity.id ? false : current
      );
      setSavingMessage("Activity deleted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete activity");
    }
  }

  async function handleGenerateInstructionalImage(activityName: string): Promise<void> {
    const trimmedName = activityName.trim();
    if (
      !selectedChildId ||
      !trimmedName ||
      (hasGeneratedInstructionalImage(activityDraft.imageUrl) && Boolean(activityDraft.imageUrl)) ||
      trimmedName === lastInstructionalPreviewName
    ) {
      return;
    }

    try {
      setActivityDraftImageState((current) => ({
        ...current,
        activity: "pending"
      }));
      setLastInstructionalPreviewName(trimmedName);
      const result = await generateInstructionalImage({
        activityName: trimmedName,
        stepLabels: activityDraft.steps.map((step) => step.label)
      });

      setActivityDraft((current) => ({
        ...current,
        imageUrl: current.name.trim() === trimmedName ? result.imageUrl : current.imageUrl
      }));
      setActivityDraftImageState((current) => ({
        ...current,
        activity: "ready"
      }));
    } catch (err) {
      setActivityDraftImageState((current) => ({
        ...current,
        activity: "unavailable"
      }));
    }
  }

  function handleAddActivityStep(): void {
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
    }));
    setActivityDraftImageState((current) => ({
      ...current,
      steps: {
        ...current.steps,
        [activityDraft.steps.length]: "idle"
      }
    }));

  }

  function handleActivityDraftChange(
    updater: (current: ActivityDraft) => ActivityDraft
  ): void {
    setActivityDraft((current) => {
      const next = updater(current);
      if (next.name === current.name) {
        return next;
      }

      return {
        ...next,
        imageUrl: ""
      };
    });
    setActivityDraftImageState((current) => ({
      activity: "idle",
      steps: current.steps
    }));
    setLastInstructionalPreviewName("");
  }

  useEffect(() => {
    if (!activityEditorOpen || !selectedChildId) {
      return;
    }

    const activityName = activityDraft.name.trim() || "routine step";

    activityDraft.steps.forEach((step, index) => {
      const stepLabel = step.label.trim();
      if (!stepLabel || hasGeneratedInstructionalImage(step.imageUrl)) {
        return;
      }

      const pendingKey = `${index}:${activityName}:${stepLabel}`;
      if (pendingDraftPreviewKeys.current.has(pendingKey)) {
        return;
      }

      pendingDraftPreviewKeys.current.add(pendingKey);
      setActivityDraftImageState((current) => ({
        ...current,
        steps: {
          ...current.steps,
          [index]: "pending"
        }
      }));

      void generateInstructionalImage({
        activityName: stepLabel,
        stepLabels: [activityName]
      })
        .then((result) => {
          setActivityDraft((current) => ({
            ...current,
            steps: current.steps.map((currentStep, currentIndex) =>
              currentIndex === index && currentStep.label.trim() === stepLabel
                ? {
                    ...currentStep,
                    imageUrl: result.imageUrl
                  }
                : currentStep
            )
          }));
          setActivityDraftImageState((current) => ({
            ...current,
            steps: {
              ...current.steps,
              [index]: "ready"
            }
          }));
        })
        .catch(() => {
          setActivityDraftImageState((current) => ({
            ...current,
            steps: {
              ...current.steps,
              [index]: "unavailable"
            }
          }));
        })
        .finally(() => {
          pendingDraftPreviewKeys.current.delete(pendingKey);
        });
    });
  }, [activityDraft.name, activityDraft.steps, activityEditorOpen, selectedChildId]);

  const now = new Date();
  const currentDay = currentWeekday(now.getDay());
  const weeklyMatrixRows = selectedChildId
    ? buildWeeklyMatrixRows({
        childProfileId: selectedChildId,
        routines: state.routines,
        chores: state.chores,
        completions: state.completions,
        currentDay,
        now
      })
    : [];
  const weekDayNumbers = buildWeekDayNumbers(now);

  useEffect(() => {
    if (!shouldBackfillInstructionalImages) {
      return;
    }

    let cancelled = false;

    async function backfillMissingInstructionalImages(): Promise<void> {
      try {
        const routinesNeedingImages = state.routines.filter(
          (routine) =>
            !hasGeneratedInstructionalImage(routine.imageUrl) ||
            routine.steps.some((step) => !hasGeneratedInstructionalImage(step.imageUrl))
        );
        const choresNeedingImages = state.chores.filter(
          (chore) => !hasGeneratedInstructionalImage(chore.imageUrl)
        );

        if (routinesNeedingImages.length > 0 || choresNeedingImages.length > 0) {
          setSavedActivityImageState((current) => {
            const next = { ...current };
            for (const routine of routinesNeedingImages) {
              next[activityImageStatusKey("routine", routine.id)] = "pending";
            }
            for (const chore of choresNeedingImages) {
              next[activityImageStatusKey("chore", chore.id)] = "pending";
            }
            return next;
          });
        }

        if (routinesNeedingImages.length === 0 && choresNeedingImages.length === 0) {
          return;
        }

        const routineBackfills = await Promise.all(
          routinesNeedingImages.map(async (routine) => {
            const key = `routine:${routine.id}:${routine.name}:${routine.steps
              .map((step) => `${step.id}:${step.label}:${step.imageUrl ?? ""}`)
              .join("|")}`;
            if (pendingInstructionalBackfillKeys.current.has(key)) {
              return null;
            }

            pendingInstructionalBackfillKeys.current.add(key);
            try {
              const routineImageUrl =
                routine.imageUrl?.trim().length && hasGeneratedInstructionalImage(routine.imageUrl)
                  ? routine.imageUrl
                : (
                    await generateInstructionalImage({
                      activityName: routine.name,
                      stepLabels: routine.steps.map((step) => step.label)
                    })
                  ).imageUrl;

              const stepImageUrls = await Promise.all(
                routine.steps.map(async (step) => {
                  if (hasGeneratedInstructionalImage(step.imageUrl)) {
                    return step.imageUrl;
                  }

                  const result = await generateInstructionalImage({
                    activityName: step.label,
                    stepLabels: [routine.name]
                  });
                  return result.imageUrl;
                })
              );

              if (cancelled) {
                return null;
              }

              await fetchJson<void>(`/api/routines/${routine.id}`, {
                method: "PATCH",
                headers: {
                  ...actorHeaders,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: routine.name,
                  imageUrl: routineImageUrl,
                  schedule: {
                    days: routine.schedule.days
                  },
                  steps: routine.steps.map((step, index) => ({
                    label: step.label,
                    icon: step.icon ?? "",
                    imageUrl: stepImageUrls[index],
                    order: index
                  })),
                  ...(routine.reward ? { reward: routine.reward } : {})
                })
              });

              return {
                id: routine.id,
                imageUrl: routineImageUrl,
                stepImageUrls
              };
            } finally {
              pendingInstructionalBackfillKeys.current.delete(key);
            }
          })
        );

        const choreBackfills = await Promise.all(
          choresNeedingImages.map(async (chore) => {
            const key = `chore:${chore.id}:${chore.name}`;
            if (pendingInstructionalBackfillKeys.current.has(key)) {
              return null;
            }

            pendingInstructionalBackfillKeys.current.add(key);
            try {
              const imageUrl =
                chore.imageUrl?.trim().length && hasGeneratedInstructionalImage(chore.imageUrl)
                  ? chore.imageUrl
                : (
                    await generateInstructionalImage({
                      activityName: chore.name,
                      stepLabels: []
                    })
                  ).imageUrl;

              if (cancelled) {
                return null;
              }

              await fetchJson<void>(`/api/chores/${chore.id}`, {
                method: "PATCH",
                headers: {
                  ...actorHeaders,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  name: chore.name,
                  imageUrl,
                  recurrence: {
                    days: chore.recurrence.days
                  },
                  requiresApproval: chore.requiresApproval,
                  ...(chore.reward ? { reward: chore.reward } : {})
                })
              });

              return {
                id: chore.id,
                imageUrl
              };
            } finally {
              pendingInstructionalBackfillKeys.current.delete(key);
            }
          })
        );

        if (cancelled) {
          return;
        }

        const routineImageMap = new Map(
          routineBackfills
            .filter(
              (entry): entry is { id: string; imageUrl: string; stepImageUrls: string[] } =>
                entry !== null
            )
            .map((entry) => [entry.id, entry])
        );
        const choreImageMap = new Map(
          choreBackfills
            .filter((entry): entry is { id: string; imageUrl: string } => entry !== null)
            .map((entry) => [entry.id, entry])
        );

        if (routineImageMap.size === 0 && choreImageMap.size === 0) {
          return;
        }

        setState((current) => ({
          ...current,
          routines: current.routines.map((routine) => {
            const backfill = routineImageMap.get(routine.id);
            if (!backfill) {
              return routine;
            }

            return {
              ...routine,
              imageUrl: backfill.imageUrl,
              steps: routine.steps.map((step, index) => ({
                ...step,
                imageUrl: backfill.stepImageUrls[index] ?? step.imageUrl
              }))
            };
          }),
          chores: current.chores.map((chore) => {
            const backfill = choreImageMap.get(chore.id);
            if (!backfill) {
              return chore;
            }

            return {
              ...chore,
              imageUrl: backfill.imageUrl
            };
          })
        }));
        setSavedActivityImageState((current) => {
          const next = { ...current };
          for (const routineId of routineImageMap.keys()) {
            delete next[activityImageStatusKey("routine", routineId)];
          }
          for (const choreId of choreImageMap.keys()) {
            delete next[activityImageStatusKey("chore", choreId)];
          }
          return next;
        });
      } catch (err) {
        setSavedActivityImageState((current) => {
          const next = { ...current };
          for (const routine of state.routines.filter(
            (entry) =>
              !hasGeneratedInstructionalImage(entry.imageUrl) ||
              entry.steps.some((step) => !hasGeneratedInstructionalImage(step.imageUrl))
          )) {
            next[activityImageStatusKey("routine", routine.id)] = "unavailable";
          }
          for (const chore of state.chores.filter(
            (entry) => !hasGeneratedInstructionalImage(entry.imageUrl)
          )) {
            next[activityImageStatusKey("chore", chore.id)] = "unavailable";
          }
          return next;
        });
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to backfill instructional images");
        }
      }
    }

    void backfillMissingInstructionalImages();

    return () => {
      cancelled = true;
    };
  }, [state.chores, state.routines]);

  const persistedCompletionArtwork = Object.fromEntries(
    state.completions
      .filter(
        (completion) =>
          Boolean(completion.celebrationImageUrl) && isCompletionInVisibleWeek(completion, now)
      )
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

  async function handleDeleteMatrixCompletion(args: {
    row: (typeof weeklyMatrixRows)[number];
    day: Weekday;
    completionId: string;
  }): Promise<void> {
    const { row, day, completionId } = args;
    const artworkKey = completionArtworkKey(row.childProfileId, day, row.id);

    try {
      await fetchJson<void>(`/api/completions/${completionId}`, {
        method: "DELETE",
        headers: actorHeaders
      });

      setState((current) => ({
        ...current,
        completions: current.completions.filter((entry) => entry.id !== completionId),
        rewards: current.rewards.filter((reward) => reward.id !== completionId)
      }));
      setCompletionArtwork((current) => {
        const next = { ...current };
        delete next[artworkKey];
        return next;
      });
      setStickerSpotlight((current) =>
        current?.activityName === row.name && current.day === day ? null : current
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to unmark completion");
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

    if (pendingCompletionKeys.current.has(artworkKey)) {
      return;
    }

    if (todayCell.completed && todayCell.completionId) {
      await handleDeleteMatrixCompletion({
        row,
        day: today,
        completionId: todayCell.completionId
      });
      return;
    }

    pendingCompletionKeys.current.add(artworkKey);
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

      const child = state.childProfiles.find((entry) => entry.id === row.childProfileId);
      if (!child) {
        pendingCompletionKeys.current.delete(artworkKey);
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
          pendingCompletionKeys.current.delete(artworkKey);
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
          pendingCompletionKeys.current.delete(artworkKey);
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
      pendingCompletionKeys.current.delete(artworkKey);
      setCompletionArtwork((current) => {
        const next = { ...current };
        delete next[artworkKey];
        return next;
      });
      setCelebrationOverlay(null);
      setError(err instanceof Error ? err.message : "Unable to record completion");
    }
  }

  return (
    <main className="app-shell">
      {error || savingMessage ? (
        <div className="feedback-stack" aria-live="polite" aria-atomic="true">
          {error ? <p className="feedback error">{error}</p> : null}
          {savingMessage ? <p className="feedback success">{savingMessage}</p> : null}
        </div>
      ) : null}

      <nav className="mode-switch panel" aria-label="Top-level navigation">
        <button type="button" aria-pressed={activeRoute === "matrix"} onClick={() => navigateTo("matrix")}>
          Sticker Chart
        </button>
        <button type="button" aria-pressed={activeRoute === "setup"} onClick={() => openSetupSection(setupSection)}>
          Setup
        </button>
        <button type="button" aria-pressed={activeRoute === "history"} onClick={() => navigateTo("history")}>
          History
        </button>
      </nav>

      {activeRoute === "setup" ? (
        <SetupWorkspace
          section={setupSection}
          childEditorOpen={childEditorOpen}
          activityEditorOpen={activityEditorOpen}
          childDraft={childDraft}
          activityDraft={activityDraft}
          activityImageState={activityDraftImageState}
          savedActivityImageState={savedActivityImageState}
          childProfiles={state.childProfiles}
          selectedChildId={selectedChildId}
          routines={state.routines}
          chores={state.chores}
          onSelectSection={openSetupSection}
          onSelectChild={(childId) => void handleSelectChild(childId)}
          onStartCreateChild={startCreateChild}
          onStartCreateActivity={startCreateActivity}
          onChildDraftChange={(updater) => setChildDraft((current) => updater(current))}
          onActivityDraftChange={handleActivityDraftChange}
          onSubmitChild={handleSubmitChildProfile}
          onSubmitActivity={handleCreateActivity}
          onEditChild={beginEditChild}
          onDeleteChild={(child) => void handleDeleteChildProfile(child)}
          onCancelChildEdit={cancelChildEditor}
          onEditRoutine={handleEditRoutine}
          onEditChore={handleEditChore}
          onDeleteActivity={(activity) => void handleDeleteActivity(activity)}
          onCancelActivityEdit={cancelActivityEditor}
          onActivityNameBlur={(value) => void handleGenerateInstructionalImage(value)}
          onAddActivityStep={handleAddActivityStep}
          onRemoveActivityStep={(stepIndex) =>
            {
              setActivityDraft((current) => ({
                ...current,
                steps: current.steps.filter((_, index) => index !== stepIndex)
              }));
              setActivityDraftImageState((current) => ({
                ...current,
                steps: Object.fromEntries(
                  Object.entries(current.steps)
                    .filter(([key]) => Number(key) !== stepIndex)
                    .map(([key, value]) => [
                      Number(key) > stepIndex ? Number(key) - 1 : Number(key),
                      value
                    ])
                )
              }));
            }
          }
          onUpdateActivityStepLabel={(stepIndex, value) =>
            {
              setActivityDraft((current) => ({
                ...current,
                steps: current.steps.map((step, index) =>
                  index === stepIndex
                    ? {
                        ...step,
                        label: value,
                        imageUrl: ""
                      }
                    : step
                )
              }));
              setActivityDraftImageState((current) => ({
                ...current,
                steps: {
                  ...current.steps,
                  [stepIndex]: value.trim() ? "pending" : "idle"
                }
              }));
            }
          }
          onToggleActivityDay={(day) =>
            setActivityDraft((current) => ({
              ...current,
              selectedDays: toggleDay(current.selectedDays, day)
            }))
          }
        />
      ) : null}

      {activeRoute === "matrix" ? (
        <section className="sticker-chart-shell">
          <WeeklyMatrix
            childProfiles={state.childProfiles}
            selectedChildId={selectedChildId}
            rows={weeklyMatrixRows}
            currentDay={currentDay}
            dayNumbers={weekDayNumbers}
            artwork={weeklyMatrixArtwork}
            onSelectChild={(childId) => void handleSelectChild(childId)}
            onToggleCell={(row) => void handleToggleMatrixCell(row)}
            onOpenSticker={({ activityName, day, imageUrl }) =>
              setStickerSpotlight({ activityName, day, imageUrl })
            }
            onDeleteSticker={({ row, day, completionId }) =>
              void handleDeleteMatrixCompletion({ row, day, completionId })
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

      {stickerSpotlight ? (
        <div
          className="celebration-overlay is-ready"
          role="dialog"
          aria-modal="true"
          aria-label={`Sticker view for ${stickerSpotlight.activityName}`}
        >
          <div className="celebration-overlay-backdrop" onClick={() => setStickerSpotlight(null)} />
          <div className="celebration-overlay-card history-spotlight-card">
            <button
              type="button"
              className="secondary-button history-spotlight-close"
              onClick={() => setStickerSpotlight(null)}
            >
              Close
            </button>
            <img
              className="celebration-overlay-image completion-reveal"
              src={stickerSpotlight.imageUrl}
              alt={`Expanded sticker for ${stickerSpotlight.activityName}`}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}
