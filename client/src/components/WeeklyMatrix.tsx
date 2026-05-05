import type { CSSProperties } from "react";

import { weekDays } from "../app/constants";
import type { ChildProfile, Weekday, WeeklyMatrixRow } from "../app/types";

type WeeklyMatrixArtwork = {
  status: "todo" | "completed" | "pendingImage" | "imageReady" | "imageUnavailable";
  imageUrl?: string;
};

type WeeklyMatrixProps = {
  childProfiles: ChildProfile[];
  selectedChildId: string;
  rows: WeeklyMatrixRow[];
  currentDay: Weekday;
  dayNumbers: Record<Weekday, number>;
  artwork: Record<string, WeeklyMatrixArtwork | undefined>;
  onSelectChild: (childId: string) => void;
  onToggleCell: (row: WeeklyMatrixRow) => void;
  onOpenSticker: (args: { activityName: string; day: Weekday; imageUrl: string }) => void;
  onDeleteSticker: (args: { row: WeeklyMatrixRow; day: Weekday; completionId: string }) => void;
};

export function WeeklyMatrix({
  childProfiles,
  selectedChildId,
  rows,
  currentDay,
  dayNumbers,
  artwork,
  onSelectChild,
  onToggleCell,
  onOpenSticker,
  onDeleteSticker
}: WeeklyMatrixProps) {
  const currentMonthLabel = new Date().toLocaleString("en-US", { month: "long" });

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

  function renderCompletedArtwork(row: WeeklyMatrixRow, day: Weekday, imageUrl: string) {
    return (
      <span className="matrix-cell-stage">
        <span className="completion-art completion-reveal matrix-art">
          <img src={imageUrl} alt={`Celebration image for ${row.name} on ${day}`} />
        </span>
      </span>
    );
  }

  return (
    <article className="panel weekly-matrix-panel">
      <header className="panel-header sticker-chart-header">
        <div className="sticker-chart-header-copy">
          <p className="section-kicker">Sticker Chart</p>
          <h2>Weekly sticker progress</h2>
          <p className="sticker-chart-week-context">{currentMonthLabel}</p>
        </div>
        <div className="sticker-chart-header-controls" aria-label="Active child selector">
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
      </header>

      <table aria-label="Weekly completion matrix" className="weekly-matrix">
        <colgroup>
          <col className="weekly-matrix-activity-col" />
          {weekDays.map((day) => (
            <col key={day.value} className="weekly-matrix-day-col" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th scope="col">Activity</th>
            {weekDays.map((day) => (
              <th
                key={day.value}
                scope="col"
                aria-current={day.value === currentDay ? "date" : undefined}
              >
                <span className="matrix-day-label">{day.label}</span>
                <span className="matrix-day-number">{dayNumbers[day.value]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row">
                <div className="matrix-row-header">
                  {row.imageUrl ? (
                    <img
                      className="matrix-row-image"
                      src={row.imageUrl}
                      alt={`Picture for ${row.name}`}
                    />
                  ) : null}
                  <div className="matrix-row-copy">
                    <strong>{row.name}</strong>
                    {row.steps.length > 0 ? (
                      <ol className="matrix-step-list" aria-label={`Steps for ${row.name}`}>
                        {row.steps.map((step, index) => (
                          <li key={step.id} className="matrix-step-item">
                            <img
                              className="matrix-step-thumb"
                              src={step.imageUrl ?? undefined}
                              alt={`Picture for ${step.label}`}
                              title={`Step ${index + 1}: ${step.label}`}
                            />
                            <span className="matrix-step-label">{step.label}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                </div>
              </th>
              {row.cells.map((cell) => {
                const artKey = `${row.childProfileId}:${cell.day}:${row.id}`;
                const art = artwork[artKey];
                const isPending = art?.status === "pendingImage";
                const isComplete =
                  cell.completed || art?.status === "pendingImage" || art?.status === "imageReady";
                const isCelebrating = art?.status === "imageReady";
                const showImageOnly = art?.status === "imageReady" && Boolean(art.imageUrl);
                const showStaticCompletedImage =
                  !cell.interactive &&
                  cell.completed &&
                  art?.status === "imageReady" &&
                  Boolean(art.imageUrl);
                const canDeleteSticker = cell.interactive && Boolean(cell.completionId) && showImageOnly;

                return (
                  <td key={`${row.id}-${cell.day}`} data-today={cell.day === currentDay || undefined}>
                    {!cell.scheduled ? <span className="matrix-empty">-</span> : null}
                    {showStaticCompletedImage ? (
                      <span className="matrix-cell-frame matrix-cell-complete is-complete is-static">
                        <button
                          type="button"
                          className="matrix-sticker-preview-button"
                          aria-label={`View sticker for ${row.name} on ${cell.day}`}
                          onClick={() =>
                            onOpenSticker({
                              activityName: row.name,
                              day: cell.day,
                              imageUrl: art.imageUrl!
                            })
                          }
                        >
                          {renderCompletedArtwork(row, cell.day, art.imageUrl!)}
                        </button>
                      </span>
                    ) : null}
                    {cell.scheduled && !cell.interactive && !showStaticCompletedImage ? (
                      <span
                        className={`matrix-cell-frame matrix-cell-placeholder${
                          cell.completed ? " is-complete" : ""
                        }`}
                        aria-label={`${
                          cell.completed ? "Completed" : "Future"
                        } ${row.rewardType === "stickers" ? "sticker" : "star"} reward placeholder for ${
                          row.name
                        } on ${cell.day}`}
                      >
                        <span className="matrix-cell-stage">
                          {renderRewardIcon(row, cell.completed ? "complete" : "muted")}
                        </span>
                      </span>
                    ) : null}
                    {cell.interactive ? (
                      !isComplete ? (
                        <button
                          type="button"
                          className={`matrix-cell-frame matrix-cell-button${isCelebrating ? " is-celebrating" : ""} is-actionable`}
                          aria-label={`Toggle ${row.name} for ${cell.day}`}
                          disabled={isPending}
                          onClick={() => onToggleCell(row)}
                        >
                          <span className="matrix-cell-stage">
                            {renderRewardIcon(row, "incomplete")}
                            <span
                              className="visually-hidden"
                              aria-label={`${
                                row.rewardType === "stickers" ? "Sticker" : "Star"
                              } reward target for ${row.name}`}
                            >
                              {row.rewardType === "stickers" ? "Sticker" : "Star"} reward target
                            </span>
                            <span
                              className="matrix-cell-cta"
                              style={{
                                left: "0.25rem",
                                right: "0.25rem",
                                transform: "none",
                                width: "auto",
                                whiteSpace: "normal"
                              }}
                            >
                              Tap to earn
                            </span>
                            {art?.status === "pendingImage" ? <span>Creating image...</span> : null}
                          </span>
                        </button>
                      ) : showImageOnly ? (
                        <div
                          className={`matrix-cell-frame matrix-cell-complete${isCelebrating ? " is-celebrating" : ""}`}
                        >
                          <button
                            type="button"
                            className="matrix-sticker-preview-button"
                            aria-label={`View sticker for ${row.name} on ${cell.day}`}
                            onClick={() =>
                              onOpenSticker({
                                activityName: row.name,
                                day: cell.day,
                                imageUrl: art.imageUrl!
                              })
                            }
                          >
                            {renderCompletedArtwork(row, cell.day, art.imageUrl!)}
                          </button>
                          <div className="matrix-cell-actions">
                            {canDeleteSticker ? (
                              <button
                                type="button"
                                className="danger-button matrix-cell-action-button"
                                aria-label={`Delete sticker for ${row.name} on ${cell.day}`}
                                onClick={() =>
                                  onDeleteSticker({
                                    row,
                                    day: cell.day,
                                    completionId: cell.completionId!
                                  })
                                }
                              >
                                x
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className={`matrix-cell-frame matrix-cell-button is-complete${
                            isCelebrating ? " is-celebrating" : ""
                          }`}
                          aria-label={`Toggle ${row.name} for ${cell.day}`}
                          disabled={isPending}
                          onClick={() => onToggleCell(row)}
                        >
                          <span className="matrix-cell-stage">
                            {renderRewardIcon(row, "complete")}
                            <span>Completed</span>
                            {art?.status === "pendingImage" ? <span>Creating image...</span> : null}
                            {art?.status === "imageUnavailable" ? <span>Image unavailable</span> : null}
                          </span>
                        </button>
                      )
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
