import type { Dispatch, FormEvent, SetStateAction } from "react";

import { weekDays } from "../app/constants";
import type {
  ActivityDraft,
  Chore,
  Routine,
  Weekday
} from "../app/types";

type ParentWorkspaceProps = {
  activityDraft: ActivityDraft;
  selectedChildId: string;
  routines: Routine[];
  chores: Chore[];
  onActivityDraftChange: Dispatch<SetStateAction<ActivityDraft>>;
  onCreateActivity: (event: FormEvent<HTMLFormElement>) => void;
  onActivityNameBlur: () => void;
  onEditRoutine: (routine: Routine) => void;
  onEditChore: (chore: Chore) => void;
  onDeleteActivity: (activity: { id: string; name: string; type: "routine" | "chore" }) => void;
  onAddActivityStep: () => void;
  onUpdateActivityStep: (
    stepIndex: number,
    field: "label" | "icon" | "imageUrl",
    value: string
  ) => void;
  onToggleActivityDay: (day: Weekday) => void;
};

export function ParentWorkspace({
  activityDraft,
  selectedChildId,
  routines,
  chores,
  onActivityDraftChange,
  onCreateActivity,
  onActivityNameBlur,
  onEditRoutine,
  onEditChore,
  onDeleteActivity,
  onAddActivityStep,
  onUpdateActivityStep,
  onToggleActivityDay
}: ParentWorkspaceProps) {
  const childActivities = [
    ...routines
      .filter((routine) => routine.childProfileId === selectedChildId)
      .map((routine) => ({
        id: routine.id,
        name: routine.name,
        kind: "Step-based activity",
        canEdit: true,
        routine
      })),
    ...chores
      .filter((chore) => chore.childProfileId === selectedChildId)
      .map((chore) => ({
        id: chore.id,
        name: chore.name,
        kind: "Single-action activity",
        canEdit: true,
        routine: null,
        chore
      }))
  ];

  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="section-kicker">Activities</p>
          <h2>Activity builder</h2>
        </div>
      </header>

      <form className="stack-form" onSubmit={onCreateActivity}>
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
            onBlur={onActivityNameBlur}
            disabled={!selectedChildId}
          />
        </label>

        {activityDraft.imageUrl ? (
          <div className="completion-art">
            <img src={activityDraft.imageUrl} alt="Instructional image preview" />
          </div>
        ) : null}

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={activityDraft.requiresApproval}
            onChange={(event) =>
              onActivityDraftChange((current) => ({
                ...current,
                requiresApproval: event.target.checked
              }))
            }
            disabled={!selectedChildId}
          />
          <span>Requires parent approval when there are no subtasks</span>
        </label>

        {activityDraft.steps.map((step, index) => (
          <div key={`activity-step-${index}`} className="stack-form">
            <label>
              {`Step ${index + 1} label`}
              <input
                value={step.label}
                onChange={(event) =>
                  onUpdateActivityStep(index, "label", event.target.value)
                }
                disabled={!selectedChildId}
              />
            </label>
            <label>
              {`Step ${index + 1} icon`}
              <input
                value={step.icon}
                onChange={(event) =>
                  onUpdateActivityStep(index, "icon", event.target.value)
                }
                disabled={!selectedChildId}
              />
            </label>
            <label>
              {`Step ${index + 1} image URL`}
              <input
                value={step.imageUrl}
                onChange={(event) =>
                  onUpdateActivityStep(index, "imageUrl", event.target.value)
                }
                disabled={!selectedChildId}
              />
            </label>
          </div>
        ))}

        <button type="button" onClick={onAddActivityStep} disabled={!selectedChildId}>
          Add activity step
        </button>

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

        <label>
          Reward amount
          <input
            type="number"
            min="1"
            aria-label="Reward amount"
            value={activityDraft.rewardAmount}
            onChange={(event) =>
              onActivityDraftChange((current) => ({
                ...current,
                rewardAmount: event.target.value
              }))
            }
            disabled={!selectedChildId}
          />
        </label>

        <label>
          Reward type
          <select
            aria-label="Reward type"
            value={activityDraft.rewardType}
            onChange={(event) =>
              onActivityDraftChange((current) => ({
                ...current,
                rewardType: event.target.value as ActivityDraft["rewardType"]
              }))
            }
            disabled={!selectedChildId}
          >
            <option value="">No reward</option>
            <option value="stars">Stars</option>
            <option value="stickers">Stickers</option>
          </select>
        </label>

        <button type="submit" disabled={!selectedChildId}>
          {activityDraft.editingActivityId ? "Update activity" : "Save activity"}
        </button>
      </form>

      <ul className="item-list">
        {childActivities.map((activity) => (
          <li key={activity.id}>
            <span>{activity.name}</span>
            <span>{activity.kind}</span>
            <div className="inline-actions">
              {activity.canEdit && activity.routine ? (
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={`Edit activity ${activity.name}`}
                  onClick={() => onEditRoutine(activity.routine)}
                >
                  Edit
                </button>
              ) : null}
              {activity.canEdit && "chore" in activity && activity.chore ? (
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
                    type: activity.routine ? "routine" : "chore"
                  })
                }
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
