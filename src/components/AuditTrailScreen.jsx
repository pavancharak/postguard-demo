import { useState } from "react";

export function AuditTrailScreen({ auditStore, onNavigate }) {
  const [results, setResults] = useState({});
  const records = [...auditStore.getAll()].reverse();

  const handleVerify = (id) => {
    const result = auditStore.verify(id);
    setResults((prev) => ({ ...prev, [id]: result }));
  };

  return (
    <div className="screen audit-screen">
      <button className="btn link back" onClick={() => onNavigate("home")}>
        ← Back
      </button>
      <h2>Audit Trail</h2>
      <p className="subtitle">
        Every verification decision made in this session, signed with
        HMAC-SHA256 and stored in localStorage. Nothing here is display-only —
        "Verify" recomputes the signature live.
      </p>

      {records.length === 0 ? (
        <p className="empty-state">
          No decisions recorded yet. Go verify a post first.
        </p>
      ) : (
        <ul className="audit-list">
          {records.map((record) => {
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
                    {record.policyResult.pass ? "Approved" : "Blocked"}
                  </span>
                </div>
                <p className="post-text small">{record.text}</p>
                <div className="audit-meta">
                  <span>ID: {record.id}</span>
                  <span>Signed: {new Date(record.createdAt).toLocaleString()}</span>
                </div>
                <div className="signature-row">
                  <code>sig_{record.auditSignature.slice(0, 16)}</code>
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
      )}
    </div>
  );
}
