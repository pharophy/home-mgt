import { useMemo, useState } from "react";

import { useCompactTablet } from "../app/use-compact-tablet";
import type { ChildProfile, Chore, Completion, Routine } from "../app/types";

type HistoryPageProps = {
  childProfiles: ChildProfile[];
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
};

type HistoryView = "month" | "gallery";
type HistoryBucket = {
  key: string;
  label: string;
  items: Completion[];
};

const calendarWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildHistoryBuckets(completions: Completion[]): HistoryBucket[] {
  const bucketMap = new Map<string, Completion[]>();

  for (const completion of completions) {
    const key = (completion.completedAt ?? "").slice(0, 10);
    if (!key) {
      continue;
    }

    const existing = bucketMap.get(key) ?? [];
    existing.push(completion);
    bucketMap.set(key, existing);
  }

  return [...bucketMap.entries()]
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([key, items]) => ({
      key,
      label: formatDateLabel(key),
      items
    }));
}

function resolveActivityName(
  completion: Completion,
  routines: Routine[],
  chores: Chore[]
): string {
  if (completion.itemType === "chore") {
    return chores.find((entry) => entry.id === completion.itemId)?.name ?? "Deleted activity";
  }

  if (completion.itemType === "routine") {
    return routines.find((entry) => entry.id === completion.itemId)?.name ?? "Deleted activity";
  }

  if (completion.parentEntityType === "routine" && completion.parentEntityId) {
    return routines.find((entry) => entry.id === completion.parentEntityId)?.name ?? "Deleted routine";
  }

  return "Deleted activity";
}

function formatDateLabel(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export function HistoryPage({
  childProfiles,
  routines,
  chores,
  completions
}: HistoryPageProps) {
  const isCompactTablet = useCompactTablet();
  const stickerHistory = completions
    .filter((completion) => Boolean(completion.celebrationImageUrl))
    .slice()
    .sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? ""));
  const dateBuckets = useMemo<HistoryBucket[]>(() => buildHistoryBuckets(stickerHistory), [stickerHistory]);
  const latestBucket = dateBuckets[0] ?? null;
  const [view, setView] = useState<HistoryView>("month");
  const [selectedChildId, setSelectedChildId] = useState("all");
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
  const [loadedImageKeys, setLoadedImageKeys] = useState<Record<string, boolean>>({});
  const [visibleMonth, setVisibleMonth] = useState(
    latestBucket?.key.slice(0, 7) ?? new Date().toISOString().slice(0, 7)
  );
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(latestBucket?.key ?? null);
  const filteredHistory = useMemo(
    () =>
      selectedChildId === "all"
        ? stickerHistory
        : stickerHistory.filter((completion) => completion.childProfileId === selectedChildId),
    [selectedChildId, stickerHistory]
  );
  const filteredDateBuckets = useMemo(
    () => buildHistoryBuckets(filteredHistory),
    [filteredHistory]
  );
  const monthBuckets = filteredDateBuckets.filter((bucket) => bucket.key.startsWith(visibleMonth));
  const selectedBucket =
    filteredDateBuckets.find((bucket) => bucket.key === selectedDateKey) ?? monthBuckets[0] ?? null;
  const visibleMonthDate = new Date(`${visibleMonth}-01T00:00:00`);
  const visibleMonthLabel = visibleMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  function shiftVisibleMonth(offset: number) {
    const next = new Date(`${visibleMonth}-01T00:00:00`);
    next.setMonth(next.getMonth() + offset);
    const nextMonthKey = next.toISOString().slice(0, 7);
    setVisibleMonth(nextMonthKey);
    const nextMonthBuckets = filteredDateBuckets.filter((bucket) => bucket.key.startsWith(nextMonthKey));
    setSelectedDateKey(nextMonthBuckets[0]?.key ?? null);
  }

  function handleChildFilterChange(nextChildId: string) {
    setSelectedChildId(nextChildId);
    setSpotlightIndex(null);

    const nextHistory =
      nextChildId === "all"
        ? stickerHistory
        : stickerHistory.filter((completion) => completion.childProfileId === nextChildId);
    const nextBuckets = buildHistoryBuckets(nextHistory);
    const nextLatestBucket = nextBuckets[0] ?? null;

    if (nextLatestBucket) {
      setVisibleMonth(nextLatestBucket.key.slice(0, 7));
      setSelectedDateKey(nextLatestBucket.key);
      return;
    }

    setSelectedDateKey(null);
  }

  const spotlightItems = view === "gallery" ? filteredHistory : selectedBucket?.items ?? [];
  const spotlightItem =
    spotlightIndex !== null ? spotlightItems[spotlightIndex] ?? null : null;

  function markImageLoaded(key: string) {
    setLoadedImageKeys((current) => ({
      ...current,
      [key]: true
    }));
  }

  const calendarCells = useMemo(() => {
    const [year, month] = visibleMonth.split("-").map(Number);
    const firstDay = new Date(year, (month ?? 1) - 1, 1);
    const daysInMonth = new Date(year, month ?? 1, 0).getDate();
    const cells: Array<
      | { kind: "empty"; key: string }
      | { kind: "day"; key: string; dateKey: string; label: string; hasStickers: boolean }
    > = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      cells.push({ kind: "empty", key: `empty-${index}` });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = `${visibleMonth}-${String(day).padStart(2, "0")}`;
      cells.push({
        kind: "day",
        key: dateKey,
        dateKey,
        label: formatDateLabel(dateKey),
        hasStickers: filteredDateBuckets.some((bucket) => bucket.key === dateKey)
      });
    }

    return cells;
  }, [filteredDateBuckets, visibleMonth]);

  function renderProgressiveStickerImage({
    imageKey,
    imageUrl,
    alt,
    placeholderLabel,
    className
  }: {
    imageKey: string;
    imageUrl: string | undefined;
    alt: string;
    placeholderLabel: string;
    className?: string;
  }) {
    const isLoaded = Boolean(loadedImageKeys[imageKey]);

    return (
      <span className={`history-image-shell${isLoaded ? " is-loaded" : ""}`}>
        {!isLoaded ? (
          <span
            className="history-image-placeholder"
            aria-label={placeholderLabel}
          />
        ) : null}
        <img
          className={`${className ?? ""}${isLoaded ? " is-loaded" : ""}`.trim()}
          src={imageUrl}
          alt={alt}
          loading="lazy"
          onLoad={() => markImageLoaded(imageKey)}
          onError={() => markImageLoaded(imageKey)}
        />
      </span>
    );
  }

  function renderHistoryCards(items: Completion[], immersive = false) {
    return (
      <ul
        className={`history-grid${immersive ? " history-grid--immersive history-grid--masonry history-grid--full-width" : ""}`}
      >
        {items.map((completion, index) => {
          const child = childProfiles.find((entry) => entry.id === completion.childProfileId);
          const activityName = resolveActivityName(completion, routines, chores);
          const completedAt = completion.completedAt
            ? new Date(completion.completedAt).toLocaleString()
            : "Unknown time";
          const sizeClass = ["history-card--feature", "history-card--tall", "history-card--wide"][
            index % 3
          ];

          return (
            <li
              key={completion.id}
              className={`history-card ${sizeClass}${immersive ? " history-card--immersive" : ""}`}
            >
              <button
                type="button"
                className="history-card-button"
                aria-label={`View saved sticker for ${activityName}`}
                onClick={() => setSpotlightIndex(index)}
              >
                {renderProgressiveStickerImage({
                  imageKey: `gallery:${completion.id}`,
                  imageUrl: completion.celebrationImageUrl,
                  alt: `Saved sticker for ${activityName}`,
                  placeholderLabel: `Loading saved sticker for ${activityName}`
                })}
              </button>
              <div className={`history-copy${immersive ? " history-copy--overlay" : ""}`}>
                <strong>{activityName}</strong>
                <span>{child?.name ?? "Deleted child"}</span>
                <span>{completedAt}</span>
                {completion.celebrationTheme ? <span>{completion.celebrationTheme}</span> : null}
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <section
      className={`workspace-grid history-layout${isCompactTablet ? " is-compact-tablet" : ""}`}
      data-testid="history-layout"
    >
      <article className="panel history-panel">
        <header className={`panel-header${isCompactTablet ? " is-compact-tablet" : ""}`}>
          <div>
            <p className="section-kicker">History</p>
            <h2>Sticker history</h2>
          </div>
          <div className="history-controls">
            <label className="history-filter-field">
              <span>Filter history by child</span>
              <select
                value={selectedChildId}
                onChange={(event) => handleChildFilterChange(event.target.value)}
                aria-label="Filter history by child"
              >
                <option value="all">All children</option>
                {childProfiles.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="segmented-control" aria-label="History view switcher">
              <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>
                Month view
              </button>
              <button
                type="button"
                aria-pressed={view === "gallery"}
                onClick={() => setView("gallery")}
              >
                Gallery view
              </button>
            </div>
          </div>
        </header>

        {stickerHistory.length === 0 ? (
          <p className="empty-copy">
            Sticker history will appear here after completed activities generate saved art.
          </p>
        ) : filteredHistory.length === 0 ? (
          <p className="empty-copy">No saved stickers match that child yet.</p>
        ) : view === "month" ? (
          <div className="history-month-shell">
            <div className="history-month-toolbar">
              <button
                type="button"
                className="secondary-button"
                aria-label="Previous month"
                onClick={() => shiftVisibleMonth(-1)}
              >
                {"<<"}
              </button>
              <strong>{visibleMonthLabel}</strong>
              <button
                type="button"
                className="secondary-button"
                aria-label="Next month"
                onClick={() => shiftVisibleMonth(1)}
              >
                {">>"}
              </button>
            </div>

            {monthBuckets.length === 0 ? (
              <p className="empty-copy">No saved stickers in this month yet.</p>
            ) : (
              <div
                className="history-calendar"
                role="grid"
                aria-label={`Sticker calendar for ${visibleMonthLabel}`}
              >
                {calendarWeekdays.map((weekday) => (
                  <div key={weekday} className="history-calendar-weekday" role="columnheader">
                    {weekday}
                  </div>
                ))}
                {calendarCells.map((cell) =>
                  cell.kind === "empty" ? (
                    <div key={cell.key} className="history-calendar-cell is-empty" aria-hidden="true" />
                  ) : (
                    <button
                      key={cell.key}
                      type="button"
                      className={`history-calendar-cell${cell.hasStickers ? " has-stickers" : ""}${
                        cell.dateKey === selectedDateKey ? " selected" : ""
                      }`}
                      aria-label={cell.label}
                      aria-pressed={cell.dateKey === selectedDateKey}
                      onClick={() => setSelectedDateKey(cell.dateKey)}
                    >
                      <span className="history-calendar-day-number">
                        {Number(cell.dateKey.slice(-2))}
                      </span>
                      {cell.hasStickers ? (
                        <>
                          <span className="history-calendar-day-dot" aria-hidden="true" />
                          <span className="history-calendar-previews">
                            {(filteredDateBuckets.find((bucket) => bucket.key === cell.dateKey)?.items ?? [])
                              .slice(0, 4)
                              .map((completion) => {
                                const activityName = resolveActivityName(completion, routines, chores);
                                return (
                                  <span key={completion.id} className="history-calendar-preview-wrap">
                                    {renderProgressiveStickerImage({
                                      imageKey: `calendar:${completion.id}`,
                                      imageUrl: completion.celebrationImageUrl,
                                      alt: `Sticker earned on ${cell.label} for ${activityName}`,
                                      placeholderLabel: `Loading sticker earned on ${cell.label} for ${activityName}`,
                                      className: "history-calendar-preview"
                                    })}
                                  </span>
                                );
                              })}
                          </span>
                        </>
                      ) : null}
                    </button>
                  )
                )}
              </div>
            )}

            {selectedBucket ? (
              <>
                <p className="history-filter-copy">Showing stickers from {selectedBucket.label}</p>
                {renderHistoryCards(selectedBucket.items)}
              </>
            ) : (
              <p className="empty-copy">Choose a sticker day to review the saved artwork.</p>
            )}
          </div>
        ) : (
          renderHistoryCards(filteredHistory, true)
        )}
      </article>

      {spotlightItem ? (
        <div
          className="celebration-overlay is-ready"
          role="dialog"
          aria-modal="true"
          aria-label={`Sticker spotlight for ${resolveActivityName(spotlightItem, routines, chores)}`}
        >
          <div className="celebration-overlay-backdrop" onClick={() => setSpotlightIndex(null)} />
          <div className="celebration-overlay-card history-spotlight-card">
            <button
              type="button"
              className="secondary-button history-spotlight-close"
              onClick={() => setSpotlightIndex(null)}
            >
              Close
            </button>
            <img
              className="celebration-overlay-image completion-reveal"
              src={spotlightItem.celebrationImageUrl}
              alt={`Spotlight sticker for ${resolveActivityName(spotlightItem, routines, chores)}`}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
