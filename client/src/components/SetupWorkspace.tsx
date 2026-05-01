import { useEffect, type CSSProperties, type FormEvent } from "react";

import { weekDays } from "../app/constants";
import { generateInstructionalImage } from "../app/completion-imagery";
import type {
  ActivityDraft,
  ChildProfile,
  ChildProfileDraft,
  Chore,
  Routine,
  SetupSection,
  Weekday
} from "../app/types";

type SetupWorkspaceProps = {
  section: SetupSection;
  childEditorOpen: boolean;
  activityEditorOpen: boolean;
  childDraft: ChildProfileDraft;
  activityDraft: ActivityDraft;
  childProfiles: ChildProfile[];
  selectedChildId: string;
  routines: Routine[];
  chores: Chore[];
  onSelectSection: (section: SetupSection) => void;
  onSelectChild: (childId: string) => void;
  onStartCreateChild: () => void;
  onStartCreateActivity: () => void;
  onChildDraftChange: (updater: (current: ChildProfileDraft) => ChildProfileDraft) => void;
  onActivityDraftChange: (updater: (current: ActivityDraft) => ActivityDraft) => void;
  onSubmitChild: (event: FormEvent<HTMLFormElement>) => void;
  onSubmitActivity: (event: FormEvent<HTMLFormElement>) => void;
  onEditChild: (child: ChildProfile) => void;
  onDeleteChild: (child: ChildProfile) => void;
  onCancelChildEdit: () => void;
  onEditRoutine: (routine: Routine) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteActivity: (activity: { id: string; name: string; type: "routine" | "chore" }) => void;
  onCancelActivityEdit: () => void;
  onActivityNameBlur: (value: string) => void;
  onAddActivityStep: () => void;
  onRemoveActivityStep: (stepIndex: number) => void;
  onUpdateActivityStepLabel: (stepIndex: number, value: string) => void;
  onToggleActivityDay: (day: Weekday) => void;
};

export function SetupWorkspace({
  section,
  childEditorOpen,
  activityEditorOpen,
  childDraft,
  activityDraft,
  childProfiles,
  selectedChildId,
  routines,
  chores,
  onSelectSection,
  onSelectChild,
  onStartCreateChild,
  onStartCreateActivity,
  onChildDraftChange,
  onActivityDraftChange,
  onSubmitChild,
  onSubmitActivity,
  onEditChild,
  onDeleteChild,
  onCancelChildEdit,
  onEditRoutine,
  onEditChore,
  onDeleteActivity,
  onCancelActivityEdit,
  onActivityNameBlur,
  onAddActivityStep,
  onRemoveActivityStep,
  onUpdateActivityStepLabel,
  onToggleActivityDay
}: SetupWorkspaceProps) {
  const selectedChild =
    childProfiles.find((child) => child.id === selectedChildId) ?? null;
  const activityStepSignature = activityDraft.steps.map((step) => step.label.trim()).join("|");

  useEffect(() => {
    let cancelled = false;

    async function regenerateStepImages(): Promise<void> {
      const activityName = activityDraft.name.trim() || "routine step";
      const generatedImages = await Promise.all(
        activityDraft.steps.map(async (step, index) => {
          const stepLabel = step.label.trim();
          if (!stepLabel) {
            return null;
          }

          const result = await generateInstructionalImage({
            activityName: stepLabel,
            stepLabels: [activityName]
          });
          return { index, imageUrl: result.imageUrl };
        })
      );

      if (cancelled) {
        return;
      }

      onActivityDraftChange((current) => ({
        ...current,
        steps: current.steps.map((step, index) => {
          const generated = generatedImages[index];
          if (!generated?.imageUrl) {
            return step;
          }

          return {
            ...step,
            imageUrl: generated.imageUrl
          };
        })
      }));
    }

    if (!activityEditorOpen || activityDraft.steps.length === 0) {
      return;
    }

    void regenerateStepImages();

    return () => {
      cancelled = true;
    };
  }, [activityDraft.name, activityStepSignature, activityEditorOpen, onActivityDraftChange]);

  const childActivities = [
    ...routines
      .filter((routine) => routine.childProfileId === selectedChildId)
      .map((routine) => ({
        id: routine.id,
        name: routine.name,
        kind: `${routine.steps.length} step${routine.steps.length === 1 ? "" : "s"}`,
        type: "routine" as const,
        routine,
        chore: null
      })),
    ...chores
      .filter((chore) => chore.childProfileId === selectedChildId)
      .map((chore) => ({
        id: chore.id,
        name: chore.name,
        kind: chore.requiresApproval ? "Needs approval" : "Single action",
        type: "chore" as const,
        routine: null,
        chore
      }))
  ];

  return (
    <section className="setup-shell">
      <article className="panel setup-nav-panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">Setup</p>
            <h2>Manage household data</h2>
          </div>
        </header>
        <div className="segmented-control" aria-label="Setup sections">
          <button
            type="button"
            aria-pressed={section === "children"}
            onClick={() => onSelectSection("children")}
          >
            Children
          </button>
          <button
            type="button"
            aria-pressed={section === "activities"}
            onClick={() => onSelectSection("activities")}
          >
            Activities
          </button>
        </div>
      </article>

      {section === "children" ? (
        childEditorOpen ? (
          <article className="panel setup-editor-panel">
            <header className="panel-header">
              <div>
                <p className="section-kicker">Children</p>
                <h2>{childDraft.editingChildId ? "Edit child profile" : "Add new child"}</h2>
              </div>
            </header>

            <form className="stack-form" onSubmit={onSubmitChild}>
              <label>
                Child name
                <input
                  value={childDraft.name}
                  onChange={(event) =>
                    onChildDraftChange((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Display color
                <input
                  type="color"
                  value={childDraft.color}
                  onChange={(event) =>
                    onChildDraftChange((current) => ({
                      ...current,
                      color: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Interest themes
                <input
                  value={childDraft.motivatorsText}
                  onChange={(event) =>
                    onChildDraftChange((current) => ({
                      ...current,
                      motivatorsText: event.target.value
                    }))
                  }
                  placeholder="race cars, energetic blue cartoon dogs"
                />
              </label>
              <div className="button-row">
                <button type="submit">
                  {childDraft.editingChildId ? "Update child profile" : "Save child profile"}
                </button>
                <button type="button" className="secondary-button" onClick={onCancelChildEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        ) : (
          <article className="panel setup-list-panel">
            <header className="panel-header">
              <div>
                <p className="section-kicker">Children</p>
                <h2>Child profiles</h2>
              </div>
              <button type="button" className="secondary-button" onClick={onStartCreateChild}>
                Add new child
              </button>
            </header>

            {childProfiles.length === 0 ? (
              <p className="empty-copy">No child profiles yet. Add a child to start planning.</p>
            ) : (
              <ul className="entity-list">
                {childProfiles.map((child) => (
                  <li key={child.id} className="entity-card">
                    <div>
                      <div className="entity-heading">
                        <span
                          className="child-chip-swatch inline-swatch"
                          style={{ background: child.color } as CSSProperties}
                        />
                        <strong>{child.name}</strong>
                        {child.id === selectedChildId ? (
                          <span className="selection-badge">Active</span>
                        ) : null}
                      </div>
                      <p className="muted">{child.motivators.join(", ") || "No interest themes yet"}</p>
                    </div>
                    <div className="entity-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onSelectChild(child.id)}
                      >
                        {child.id === selectedChildId ? "Selected" : "Make active"}
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        aria-label={`Edit child ${child.name}`}
                        onClick={() => onEditChild(child)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        aria-label={`Delete child ${child.name}`}
                        onClick={() => onDeleteChild(child)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )
      ) : null}

      {section === "activities" ? (
        activityEditorOpen ? (
          <article className="panel setup-editor-panel">
            <header className="panel-header">
              <div>
                <p className="section-kicker">Activities</p>
                <h2>{activityDraft.editingActivityId ? "Edit activity" : "Add new activity"}</h2>
                <p className="muted">
                  {selectedChild
                    ? `Creating for ${selectedChild.name}`
                    : "Choose a child before creating an activity."}
                </p>
              </div>
            </header>

            <form className="stack-form" onSubmit={onSubmitActivity}>
              <label>
                Activity name
                <input
                  value={activityDraft.name}
                  onChange={(event) =>
                    onActivityDraftChange((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  onBlur={(event) => onActivityNameBlur(event.target.value)}
                  disabled={!selectedChildId}
                />
              </label>

              {activityDraft.imageUrl ? (
                <div className="completion-art">
                  <img src={activityDraft.imageUrl} alt="Instructional image preview" />
                </div>
              ) : null}

              <div className="stack-form">
                <div className="field-heading">
                  <strong>Schedule</strong>
                  <span className="muted">Choose the days this should appear.</span>
                </div>
                <div className="checkbox-grid">
                  {weekDays.map((day) => (
                    <label key={day.value} className="checkbox-pill">
                      <input
                        type="checkbox"
                        aria-label={`${day.label} activity`}
                        checked={activityDraft.selectedDays.includes(day.value)}
                        onChange={() => onToggleActivityDay(day.value)}
                        disabled={!selectedChildId}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

                  <div className="stack-form">
                <div className="field-heading">
                  <strong>Steps</strong>
                  <span className="muted">Add steps only when the activity needs a sequence.</span>
                </div>
                {activityDraft.steps.length === 0 ? (
                  <p className="empty-copy">No steps yet. Leave it empty for a single-action activity.</p>
                ) : (
                  <div className="step-list">
                    {activityDraft.steps.map((step, index) => (
                      <div key={`activity-step-${index}`} className="step-row">
                        {step.imageUrl ? (
                          <img
                            className="step-preview"
                            src={step.imageUrl}
                            alt={`Picture for step ${index + 1}`}
                          />
                        ) : (
                          <div className="step-preview step-preview-loading" aria-hidden="true">
                            <span>Generating image...</span>
                          </div>
                        )}
                        <div className="step-row-fields">
                          <label>
                            {`Step ${index + 1} name`}
                            <input
                              value={step.label}
                              onChange={(event) =>
                                onUpdateActivityStepLabel(index, event.target.value)
                              }
                              disabled={!selectedChildId}
                            />
                          </label>
                        </div>
                        <button
                          type="button"
                          className="secondary-button"
                          aria-label={`Remove step ${index + 1}`}
                          onClick={() => onRemoveActivityStep(index)}
                          disabled={!selectedChildId}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={onAddActivityStep} disabled={!selectedChildId}>
                  Add step
                </button>
              </div>

              <div className="button-row">
                <button type="submit" disabled={!selectedChildId}>
                  {activityDraft.editingActivityId ? "Update activity" : "Save activity"}
                </button>
                <button type="button" className="secondary-button" onClick={onCancelActivityEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </article>
        ) : (
          <article className="panel setup-list-panel">
            <header className="panel-header">
              <div>
                <p className="section-kicker">Activities</p>
                <h2>{selectedChild ? `Activities for ${selectedChild.name}` : "Activities"}</h2>
                <p className="muted">
                  {selectedChild
                    ? "Everything shown here belongs to the active child."
                    : "Choose a child first to create and manage activities."}
                </p>
              </div>
              <button
                type="button"
                className="secondary-button"
                onClick={onStartCreateActivity}
                disabled={!selectedChildId}
              >
                Add new activity
              </button>
            </header>

            <div className="profile-list activity-child-list">
              {childProfiles.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  className={`child-chip${child.id === selectedChildId ? " selected" : ""}`}
                  style={{ "--accent": child.color } as CSSProperties}
                  onClick={() => onSelectChild(child.id)}
                >
                  <span className="child-chip-swatch" />
                  <span>{child.name}</span>
                </button>
              ))}
            </div>

            {childProfiles.length === 0 ? (
              <p className="empty-copy">Add a child before creating activities.</p>
            ) : childActivities.length === 0 ? (
              <p className="empty-copy">
                {selectedChild
                  ? `No activities for ${selectedChild.name} yet.`
                  : "Choose a child to see activities."}
              </p>
            ) : (
              <ul className="entity-list">
                {childActivities.map((activity) => (
                  <li key={activity.id} className="entity-card">
                    {(activity.routine?.imageUrl ?? activity.chore?.imageUrl) ? (
                      <img
                        className="entity-card-image"
                        src={activity.routine?.imageUrl ?? activity.chore?.imageUrl}
                        alt={`Picture for ${activity.name}`}
                      />
                    ) : null}
                    <div>
                      <div className="entity-heading">
                        <strong>{activity.name}</strong>
                        <span className="selection-badge">{activity.kind}</span>
                      </div>
                      <p className="muted">{selectedChild?.name ?? "No active child"}</p>
                    </div>
                    <div className="entity-actions">
                      {activity.routine ? (
                        <button
                          type="button"
                          className="secondary-button"
                          aria-label={`Edit activity ${activity.name}`}
                          onClick={() => onEditRoutine(activity.routine)}
                        >
                          Edit
                        </button>
                      ) : null}
                      {activity.chore ? (
                        <button
                          type="button"
                          className="secondary-button"
                          aria-label={`Edit activity ${activity.name}`}
                          onClick={() => onEditChore(activity.chore)}
                        >
                          Edit
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="danger-button"
                        aria-label={`Delete activity ${activity.name}`}
                        onClick={() =>
                          onDeleteActivity({
                            id: activity.id,
                            name: activity.name,
                            type: activity.type
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        )
      ) : null}
    </section>
  );
}
