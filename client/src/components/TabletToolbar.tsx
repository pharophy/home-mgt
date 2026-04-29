import type { CelebrationMode } from "../app/types";

type TabletToolbarProps = {
  celebrationMode: CelebrationMode;
  tabletMode: boolean;
  onCelebrationModeChange: (mode: CelebrationMode) => void;
  onToggleTabletMode: () => void;
};

export function TabletToolbar({
  celebrationMode,
  tabletMode,
  onCelebrationModeChange,
  onToggleTabletMode
}: TabletToolbarProps) {
  return (
    <section className="tablet-toolbar panel">
      <div>
        <p className="section-kicker">3. Tablet mode</p>
        <h2>Child-facing controls</h2>
      </div>
      <div className="tablet-toolbar-actions">
        <label className="checkbox-inline">
          <input
            type="checkbox"
            aria-label="Gentle celebration mode"
            checked={celebrationMode === "gentle"}
            onChange={(event) =>
              onCelebrationModeChange(event.target.checked ? "gentle" : "full")
            }
          />
          <span>Gentle celebration mode</span>
        </label>
        <button type="button" onClick={onToggleTabletMode}>
          {tabletMode ? "Close tablet mode" : "Open tablet mode"}
        </button>
      </div>
    </section>
  );
}
