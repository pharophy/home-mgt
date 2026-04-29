import type { ChildProfile, Reward } from "../app/types";

type DashboardPanelProps = {
  loading: boolean;
  selectedChild: ChildProfile | null;
  pendingApprovalCount: number;
  rewards: Reward[];
  completedItems: string[];
  incompleteItems: string[];
  reviewItems: string[];
};

export function DashboardPanel({
  loading,
  selectedChild,
  pendingApprovalCount,
  rewards,
  completedItems,
  incompleteItems,
  reviewItems
}: DashboardPanelProps) {
  return (
    <article className="panel dashboard-panel">
      <header className="panel-header">
        <div>
          <p className="section-kicker">2.4 Parent dashboard</p>
          <h2>Today at a glance</h2>
        </div>
        <div className="badge-row">
          <span className="metric-badge">{pendingApprovalCount} pending approvals</span>
          <span className="metric-badge">
            {rewards.reduce((sum, reward) => sum + reward.amount, 0)} rewards earned
          </span>
        </div>
      </header>

      {loading ? <p className="empty-copy">Loading dashboard...</p> : null}

      {!loading && selectedChild ? (
        <div className="dashboard-layout">
          <section>
            <h3>{selectedChild.name}</h3>
            <p className="muted">Today is for one gentle step at a time.</p>
          </section>

          <section>
            <h3>Completed today</h3>
            {completedItems.length > 0 ? (
              <ul className="item-list">
                {completedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-copy">Nothing completed yet.</p>
            )}
          </section>

          <section>
            <h3>Still to do</h3>
            {incompleteItems.length > 0 ? (
              <ul className="item-list">
                {incompleteItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-copy">Nothing left for today.</p>
            )}
          </section>

          <section>
            <h3>Needs review or help</h3>
            {reviewItems.length > 0 ? (
              <ul className="item-list">
                {reviewItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="empty-copy">No items need review.</p>
            )}
          </section>
        </div>
      ) : null}

      {!loading && !selectedChild ? (
        <p className="empty-copy">Ready for today's plan</p>
      ) : null}
    </article>
  );
}
