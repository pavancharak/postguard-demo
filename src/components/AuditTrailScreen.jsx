import { useState } from "react";

const PAGE_SIZE = 6;

function formatMeta(ts) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function snippet(text, max = 60) {
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function AuditTrailScreen({ auditStore, onNavigate }) {
  const [results, setResults] = useState({});
  const [filter, setFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const records = [...auditStore.getAll()].reverse();
  const agents = ["All", ...new Set(records.map((r) => r.agentName))];
  const filtered =
    filter === "All" ? records : records.filter((r) => r.agentName === filter);
  const visible = filtered.slice(0, visibleCount);

  const handleVerify = (id) => {
    const result = auditStore.verify(id);
    setResults((prev) => ({ ...prev, [id]: result }));
  };

  const handleFilter = (agent) => {
    setFilter(agent);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="screen audit-screen">
      <button className="btn link back" onClick={() => onNavigate("home")}>
        ← Back
      </button>
      <h2 className="screen-title">Verification History</h2>
      <p className="trail-count">
        {records.length} decision{records.length === 1 ? "" : "s"} logged
      </p>

      {agents.length > 1 && (
        <div className="filter-row">
          {agents.map((agent) => (
            <button
              key={agent}
              className={`filter-pill ${filter === agent ? "active" : ""}`}
              onClick={() => handleFilter(agent)}
            >
              {agent}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="empty-state">
          No decisions recorded yet. Go verify a post first.
        </p>
      ) : (
        <>
          <ul className="audit-list">
            {visible.map((record) => {
              const result = results[record.id];
              return (
                <li key={record.id} className="audit-record">
                  <div className="audit-record-header">
                    <span className="agent-badge">{record.agentName}</span>
                    <span
                      className={`tag ${
                        record.policyResult.pass ? "verified" : "blocked"
                      }`}
                    >
                      {record.policyResult.pass ? "✅ Approved" : "❌ Blocked"}
                    </span>
                  </div>
                  <p className="post-text small">
                    &ldquo;{snippet(record.text)}&rdquo;
                  </p>
                  <div className="audit-meta">
                    {formatMeta(record.timestamp)}
                  </div>
                  <div className="audit-record-footer">
                    <code className="audit-sig">
                      sig_{record.auditSignature.slice(0, 10)}…
                    </code>
                    <button
                      className="btn secondary small"
                      onClick={() => handleVerify(record.id)}
                    >
                      Verify
                    </button>
                  </div>
                  {result && (
                    <div
                      className={`verify-result small ${
                        result.valid ? "valid" : "invalid"
                      }`}
                    >
                      {result.valid ? "✔" : "✘"} {result.reason}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {visibleCount < filtered.length && (
            <div className="load-more-row">
              <button
                className="btn secondary"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                Load more…
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
