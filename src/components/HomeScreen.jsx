import { posts } from "../data";

export function HomeScreen({ auditStore, onNavigate }) {
  const totalPosts = posts.length;
  const totalDecisions = auditStore.getAll().length;
  const approved = auditStore.getAll().filter((r) => r.policyResult?.pass).length;
  const blocked = totalDecisions - approved;

  return (
    <div className="screen home-screen">
      <div className="brand-mark">🛡️ PostGuard</div>
      <p className="tagline">
        Real authorization for AI-generated posts — powered by Parmana.
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{totalPosts}</div>
          <div className="stat-label">Drafted Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalDecisions}</div>
          <div className="stat-label">Signed Decisions</div>
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

      <div className="how-it-works">
        <h3>How this demo works</h3>
        <ol>
          <li>An AI agent drafts a post.</li>
          <li>
            <strong>PolicyEngine</strong> evaluates it against real brand
            rules — weekday, profanity, length, required hashtag.
          </li>
          <li>
            <strong>SignatureService</strong> signs the decision with
            HMAC-SHA256. The signing key never leaves the backend layer.
          </li>
          <li>
            <strong>AuditStore</strong> persists the signed decision. Any
            edit to a stored record breaks its signature.
          </li>
        </ol>
      </div>

      <div className="button-row">
        <button className="btn primary" onClick={() => onNavigate("drafts")}>
          View Drafted Posts
        </button>
        <button className="btn secondary" onClick={() => onNavigate("audit")}>
          Open Audit Trail
        </button>
      </div>
    </div>
  );
}
