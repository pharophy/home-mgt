import type { FormEvent } from "react";

import type { ChildProfile, ChildProfileDraft } from "../app/types";

type ChildProfilesPageProps = {
  childDraft: ChildProfileDraft;
  childProfiles: ChildProfile[];
  selectedChildId: string;
  onChildDraftChange: (updater: (current: ChildProfileDraft) => ChildProfileDraft) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEditChild: (child: ChildProfile) => void;
  onDeleteChild: (child: ChildProfile) => void;
  onSelectChild: (childId: string) => void;
  onCancelEdit: () => void;
};

export function ChildProfilesPage({
  childDraft,
  childProfiles,
  selectedChildId,
  onChildDraftChange,
  onSubmit,
  onEditChild,
  onDeleteChild,
  onSelectChild,
  onCancelEdit
}: ChildProfilesPageProps) {
  return (
    <section className="workspace-grid">
      <article className="panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">Children</p>
            <h2>{childDraft.editingChildId ? "Edit child profile" : "Create child profile"}</h2>
          </div>
        </header>

        <form className="stack-form" onSubmit={onSubmit}>
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
            Avatar or photo URL
            <input
              value={childDraft.avatarUrl}
              onChange={(event) =>
                onChildDraftChange((current) => ({
                  ...current,
                  avatarUrl: event.target.value
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
            {childDraft.editingChildId ? (
              <button type="button" className="secondary-button" onClick={onCancelEdit}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </article>

      <article className="panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">Profiles</p>
            <h2>All child profiles</h2>
          </div>
        </header>

        <ul className="entity-list">
          {childProfiles.map((child) => (
            <li key={child.id} className="entity-card">
              <div>
                <div className="entity-heading">
                  <span className="child-chip-swatch inline-swatch" style={{ background: child.color }} />
                  <strong>{child.name}</strong>
                </div>
                <p className="muted">{child.motivators.join(", ") || "No interest themes yet"}</p>
              </div>
              <div className="entity-actions">
                <button type="button" className="secondary-button" onClick={() => onSelectChild(child.id)}>
                  {child.id === selectedChildId ? "Selected" : "Use in planner"}
                </button>
                <button type="button" className="secondary-button" aria-label={`Edit child ${child.name}`} onClick={() => onEditChild(child)}>
                  Edit
                </button>
                <button type="button" className="danger-button" aria-label={`Delete child ${child.name}`} onClick={() => onDeleteChild(child)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        {childProfiles.length === 0 ? (
          <p className="empty-copy">No child profiles yet. Create one to start planning.</p>
        ) : null}
      </article>
    </section>
  );
}
