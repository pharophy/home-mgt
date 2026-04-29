import type { Weekday } from "../app/types";
import { weekDays } from "../app/constants";

export type CompletionRow = {
  id: string;
  name: string;
  pictureUrl?: string;
  status: "todo" | "completed" | "pendingImage" | "imageReady" | "imageUnavailable";
  imageUrl?: string;
};

type CompletionWorkspaceProps = {
  selectedPersonId: string;
  selectedDay: Weekday;
  personOptions: Array<{ id: string; label: string }>;
  rows: CompletionRow[];
  onSelectPerson: (personId: string) => void;
  onSelectDay: (day: Weekday) => void;
  onCompleteRow: (rowId: string) => void;
};

export function CompletionWorkspace({
  selectedPersonId,
  selectedDay,
  personOptions,
  rows,
  onSelectPerson,
  onSelectDay,
  onCompleteRow
}: CompletionWorkspaceProps) {
  return (
    <section className="workspace-grid">
      <article className="panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">Completion</p>
            <h2>Daily completion</h2>
          </div>
        </header>

        <div className="stack-form">
          <label>
            Completion person
            <select
              aria-label="Completion person"
              value={selectedPersonId}
              onChange={(event) => onSelectPerson(event.target.value)}
            >
              {personOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Completion day
            <select
              aria-label="Completion day"
              value={selectedDay}
              onChange={(event) => onSelectDay(event.target.value as Weekday)}
            >
              {weekDays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <article className="panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">Daily list</p>
            <h2>Tasks for the selected person and day</h2>
          </div>
        </header>

        {rows.length === 0 ? <p className="empty-copy">No tasks for this person and day.</p> : null}

        <ul className="item-list completion-list">
          {rows.map((row) => (
            <li key={row.id} className="completion-row">
              <div className="completion-picture">
                {row.pictureUrl ? (
                  <img src={row.pictureUrl} alt={`Task picture for ${row.name}`} />
                ) : (
                  <div aria-hidden="true" className="completion-picture-placeholder" />
                )}
              </div>
              <div className="completion-copy">
                <strong>{row.name}</strong>
                {row.status !== "todo" ? <span>{`${row.name} complete`}</span> : null}
                {row.status === "pendingImage" ? <span>Creating celebration image...</span> : null}
                {row.status === "imageUnavailable" ? <span>Celebration image unavailable</span> : null}
              </div>
              <div className="completion-action">
                {row.status === "todo" ? (
                  <button
                    type="button"
                    aria-label={`Mark ${row.name} complete`}
                    onClick={() => onCompleteRow(row.id)}
                  >
                    Complete
                  </button>
                ) : (
                  <span className="metric-badge">Completed</span>
                )}
              </div>
              {row.imageUrl ? (
                <div className="completion-art completion-reveal">
                  <img src={row.imageUrl} alt={`Celebration image for ${row.name}`} />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
