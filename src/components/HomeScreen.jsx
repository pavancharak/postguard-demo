import { posts } from "../data";
import { RULES } from "../lib/constants";

export function HomeScreen({ auditStore, onNavigate }) {
  const totalDecisions = auditStore.getAll().length;
  const approved = auditStore.getAll().filter((r) => r.policyResult?.pass).length;
  const blocked = totalDecisions - approved;

  return (
    <div className="screen home-screen">
      <div className="home-hero">
        <div className="brand-mark">🔐 PostGuard</div>
        <p className="tagline">AI posts, verified.</p>
      </div>

      <p className="home-lede">
        Your brand rules protect every AI action. Nothing an AI agent posts
        goes out until it passes these checks:
      </p>

      <ul className="rule-summary">
        {RULES.map((rule) => (
          <li key={rule.id}>
            <span className="mark">✓</span> {rule.text}
          </li>
        ))}
      </ul>

      {totalDecisions > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{posts.length}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalDecisions}</div>
            <div className="stat-label">Decisions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value approve">{approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value block">{blocked}</div>
            <div className="stat-label">Blocked</div>
          </div>
        </div>
      )}

      <div className="button-row">
        <button
          className="btn primary large"
          onClick={() => onNavigate("drafts")}
        >
          Browse AI Drafts
        </button>
        <button
          className="btn secondary large"
          onClick={() => onNavigate("audit")}
        >
          View History
        </button>
      </div>

      <div className="home-footer">Parmana · Execution Auth</div>
    </div>
  );
}
