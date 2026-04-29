import type { CSSProperties, Dispatch, FormEvent, SetStateAction } from "react";

import type {
  ChildProfile,
  ChildProfileDraft
} from "../app/types";

type ChildSetupPanelProps = {
  childDraft: ChildProfileDraft;
  childProfiles: ChildProfile[];
  selectedChildId: string;
  onChildDraftChange: Dispatch<SetStateAction<ChildProfileDraft>>;
  onSelectChild: (childId: string) => void;
  onCreateChildProfile: (event: FormEvent<HTMLFormElement>) => void;
};

export function ChildSetupPanel({
  childDraft,
  childProfiles,
  selectedChildId,
  onChildDraftChange,
  onSelectChild,
  onCreateChildProfile
}: ChildSetupPanelProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="section-kicker">Child setup</p>
          <h2>Child profile</h2>
        </div>
      </header>

      <form className="stack-form" onSubmit={onCreateChildProfile}>
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
        <button type="submit">Save child profile</button>
      </form>

      <div className="profile-list">
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
    </article>
  );
}
