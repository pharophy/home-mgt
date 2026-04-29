import type { CSSProperties } from "react";

import type { ChildProfile } from "../app/types";

type ChildSelectorPanelProps = {
  childProfiles: ChildProfile[];
  selectedChildId: string;
  title: string;
  description: string;
  onSelectChild: (childId: string) => void;
};

export function ChildSelectorPanel({
  childProfiles,
  selectedChildId,
  title,
  description,
  onSelectChild
}: ChildSelectorPanelProps) {
  return (
    <article className="panel">
      <header className="panel-header">
        <div>
          <p className="section-kicker">Children</p>
          <h2>{title}</h2>
        </div>
      </header>
      <p className="muted">{description}</p>
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
      {childProfiles.length === 0 ? (
        <p className="empty-copy">Create a child profile first to start planning.</p>
      ) : null}
    </article>
  );
}
