import type { ChildProfile, Chore, Completion, Routine } from "../app/types";

type HistoryPageProps = {
  childProfiles: ChildProfile[];
  routines: Routine[];
  chores: Chore[];
  completions: Completion[];
};

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

export function HistoryPage({
  childProfiles,
  routines,
  chores,
  completions
}: HistoryPageProps) {
  const stickerHistory = completions
    .filter((completion) => Boolean(completion.celebrationImageUrl))
    .slice()
    .sort((left, right) => (right.completedAt ?? "").localeCompare(left.completedAt ?? ""));

  return (
    <section className="workspace-grid history-layout">
      <article className="panel history-panel">
        <header className="panel-header">
          <div>
            <p className="section-kicker">History</p>
            <h2>Sticker history</h2>
          </div>
        </header>

        {stickerHistory.length === 0 ? (
          <p className="empty-copy">
            Sticker history will appear here after completed activities generate saved art.
          </p>
        ) : (
          <ul className="history-grid">
            {stickerHistory.map((completion) => {
              const child = childProfiles.find((entry) => entry.id === completion.childProfileId);
              const activityName = resolveActivityName(completion, routines, chores);
              const completedAt = completion.completedAt
                ? new Date(completion.completedAt).toLocaleString()
                : "Unknown time";

              return (
                <li key={completion.id} className="history-card">
                  <img
                    src={completion.celebrationImageUrl}
                    alt={`Saved sticker for ${activityName}`}
                  />
                  <div className="history-copy">
                    <strong>{activityName}</strong>
                    <span>{child?.name ?? "Deleted child"}</span>
                    <span>{completedAt}</span>
                    {completion.celebrationTheme ? <span>{completion.celebrationTheme}</span> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </article>
    </section>
  );
}
