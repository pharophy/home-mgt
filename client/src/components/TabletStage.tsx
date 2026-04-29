import type {
  CelebrationMode,
  ChildProfile,
  TabletTask
} from "../app/types";

type TabletStageProps = {
  selectedChild: ChildProfile | null;
  activeTabletTask: TabletTask | null;
  celebrationMode: CelebrationMode;
  tabletMessage: string | null;
  onCompleteRoutineStep: (task: Extract<TabletTask, { kind: "routineStep" }>) => void;
  onCompleteChore: (task: Extract<TabletTask, { kind: "chore" }>) => void;
};

export function TabletStage({
  selectedChild,
  activeTabletTask,
  celebrationMode,
  tabletMessage,
  onCompleteRoutineStep,
  onCompleteChore
}: TabletStageProps) {
  return (
    <section className="tablet-stage">
      <div className="tablet-card">
        <p className="tablet-mode-label">Tablet mode</p>
        <h2>{selectedChild ? `${selectedChild.name}'s next step` : "Choose a child first"}</h2>

        {activeTabletTask?.kind === "routineStep" ? (
          <div className="tablet-task">
            <p className="tablet-task-type">{activeTabletTask.routine.name}</p>
            {activeTabletTask.routine.imageUrl ? (
              <img
                src={activeTabletTask.routine.imageUrl}
                alt={`Instructional image for ${activeTabletTask.routine.name}`}
              />
            ) : null}
            <h3>{activeTabletTask.step.label}</h3>
            <p className="tablet-progress">
              Step {activeTabletTask.stepIndex + 1} of {activeTabletTask.routine.steps.length}
            </p>
            <button type="button" onClick={() => onCompleteRoutineStep(activeTabletTask)}>
              I did it
            </button>
          </div>
        ) : null}

        {activeTabletTask?.kind === "chore" ? (
          <div className="tablet-task">
            <p className="tablet-task-type">Today's chore</p>
            {activeTabletTask.chore.imageUrl ? (
              <img
                src={activeTabletTask.chore.imageUrl}
                alt={`Instructional image for ${activeTabletTask.chore.name}`}
              />
            ) : null}
            <h3>{activeTabletTask.chore.name}</h3>
            <p className="tablet-progress">One main action at a time</p>
            <button type="button" onClick={() => onCompleteChore(activeTabletTask)}>
              I finished this chore
            </button>
          </div>
        ) : null}

        {!activeTabletTask && selectedChild ? (
          <div className={`tablet-task celebration-${celebrationMode}`}>
            <p className="tablet-task-type">All done</p>
            <h3>{tabletMessage ?? "Everything for today is complete"}</h3>
            <p className="tablet-progress">Celebration mode: {celebrationMode}</p>
          </div>
        ) : null}

        {tabletMessage && activeTabletTask ? (
          <p className={`tablet-feedback celebration-${celebrationMode}`}>{tabletMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
