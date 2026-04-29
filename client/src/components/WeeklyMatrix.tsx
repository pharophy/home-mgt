import { weekDays } from "../app/constants";
import type { Weekday, WeeklyMatrixRow } from "../app/types";

type WeeklyMatrixArtwork = {
  status: "todo" | "completed" | "pendingImage" | "imageReady" | "imageUnavailable";
  imageUrl?: string;
};

type WeeklyMatrixProps = {
  rows: WeeklyMatrixRow[];
  currentDay: Weekday;
  currentDayNumber: number;
  artwork: Record<string, WeeklyMatrixArtwork | undefined>;
  onToggleCell: (row: WeeklyMatrixRow) => void;
};

export function WeeklyMatrix({
  rows,
  currentDay,
  currentDayNumber,
  artwork,
  onToggleCell
}: WeeklyMatrixProps) {
  function renderRewardIcon(
    row: WeeklyMatrixRow,
    state: "incomplete" | "complete" | "muted"
  ) {
    const rewardType = row.rewardType ?? "stars";
    const icon =
      rewardType === "stickers"
        ? state === "complete"
          ? "\u25A0"
          : "\u25A1"
        : state === "complete"
          ? "\u2605"
          : "\u2606";
    const label = rewardType === "stickers" ? "Sticker" : "Star";

    return (
      <span
        className={`matrix-reward-icon${state === "muted" ? " is-muted" : ""}`}
        aria-hidden="true"
        title={`${label} reward`}
      >
        {icon}
      </span>
    );
  }

  return (
    <article className="panel weekly-matrix-panel">
      <header className="panel-header">
        <div>
          <p className="section-kicker">This week</p>
          <h2>Weekly completion matrix</h2>
        </div>
      </header>

      <table aria-label="Weekly completion matrix" className="weekly-matrix">
        <thead>
          <tr>
            <th scope="col">Activity</th>
            {weekDays.map((day) => (
              <th
                key={day.value}
                scope="col"
                aria-current={day.value === currentDay ? "date" : undefined}
              >
                {day.label}
                {day.value === currentDay ? ` ${currentDayNumber}` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.name}</th>
              {row.cells.map((cell) => {
                const artKey = `${row.childProfileId}:${cell.day}:${row.id}`;
                const art = artwork[artKey];
                const isComplete =
                  cell.completed || art?.status === "pendingImage" || art?.status === "imageReady";
                const isCelebrating = art?.status === "imageReady";
                const showImageOnly = art?.status === "imageReady" && Boolean(art.imageUrl);

                return (
                  <td key={`${row.id}-${cell.day}`} data-today={cell.day === currentDay || undefined}>
                    {!cell.scheduled ? <span className="matrix-empty">-</span> : null}
                    {cell.scheduled && !cell.interactive ? (
                      <span
                        className="matrix-cell-placeholder"
                        aria-label={`Future ${
                          row.rewardType === "stickers" ? "sticker" : "star"
                        } reward placeholder for ${row.name} on ${cell.day}`}
                      >
                        <span className="matrix-cell-stage">
                          {renderRewardIcon(row, "muted")}
                        </span>
                      </span>
                    ) : null}
                    {cell.interactive ? (
                      <button
                        type="button"
                        className={`matrix-cell-button${isComplete ? " is-complete" : ""}${
                          isCelebrating ? " is-celebrating" : ""
                        }${!isComplete ? " is-actionable" : ""}`}
                        aria-label={`Toggle ${row.name} for ${cell.day}`}
                        onClick={() => onToggleCell(row)}
                      >
                        <span className="matrix-cell-stage">
                          {!showImageOnly
                            ? renderRewardIcon(row, isComplete ? "complete" : "incomplete")
                            : null}
                          {!isComplete && !showImageOnly ? (
                            <span
                              className="visually-hidden"
                              aria-label={`${
                                row.rewardType === "stickers" ? "Sticker" : "Star"
                              } reward target for ${row.name}`}
                            >
                              {row.rewardType === "stickers" ? "Sticker" : "Star"} reward target
                            </span>
                          ) : null}
                          {!isComplete && !showImageOnly ? (
                            <span className="matrix-cell-cta">Tap to earn</span>
                          ) : null}
                          {isComplete && !showImageOnly ? <span>Completed</span> : null}
                          {art?.status === "pendingImage" ? <span>Creating image...</span> : null}
                          {art?.status === "imageUnavailable" ? <span>Image unavailable</span> : null}
                          {art?.imageUrl ? (
                            <span className="completion-art completion-reveal matrix-art">
                              <img src={art.imageUrl} alt={`Celebration image for ${row.name}`} />
                            </span>
                          ) : null}
                        </span>
                      </button>
                    ) : null}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
