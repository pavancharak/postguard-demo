import { useEffect, useRef, useState } from "react";

export function ReceiptScreen({
  post,
  policyEngine,
  auditStore,
  onBack,
  onViewAudit,
  onRecorded,
}) {
  const [record, setRecord] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [tampered, setTampered] = useState(false);
  const processedPostId = useRef(null);

  useEffect(() => {
    // Guard against re-running (e.g. React StrictMode's double-invoke in
    // dev, or re-renders) for the same post — we only want ONE signed
    // decision written to the audit trail per verification action.
    if (processedPostId.current === post.id) return;
    processedPostId.current = post.id;

    // LAYER 1 — Authorization: real policy evaluation, not mock data.
    const policyResult = policyEngine.evaluate(post);

    // LAYER 2 + 3 — Cryptography + Audit: AuditStore.record() internally
    // signs the full decision with SignatureService and persists it to
    // localStorage. The signature returned here (`auditSignature`) is a
    // real HMAC-SHA256 over the record's contents.
    const decision = {
      postId: post.id,
      agentName: post.agentName,
      text: post.text,
      timestamp: post.timestamp,
      policyResult,
      verifiedAt: new Date().toISOString(),
    };
    const auditRecord = auditStore.record(decision);

    setRecord(auditRecord);
    onRecorded(post.id, auditRecord.id);
  }, [post, policyEngine, auditStore, onRecorded]);

  if (!record) {
    return (
      <div className="screen receipt-screen">
        <p>Signing decision…</p>
      </div>
    );
  }

  const shortSig = `sig_${record.auditSignature.slice(0, 16)}`;

  const handleVerify = () => {
    const result = auditStore.verify(record.id);
    setVerifyResult(result);
  };

  const handleTryOverride = () => {
    // Simulates an attacker (or an over-privileged admin) editing the
    // stored decision directly in localStorage — flipping a blocked post to
    // "approved" — WITHOUT going through SignatureService. This bypasses
    // the app entirely, the way a raw database edit would.
    auditStore.tamper(record.id, {
      policyResult: { pass: true, failures: [], checks: {} },
    });
    setTampered(true);
    const result = auditStore.verify(record.id);
    setVerifyResult(result);
  };

  return (
    <div className="screen receipt-screen">
      <button className="btn link back" onClick={onBack}>
        ← Back
      </button>

      {record.policyResult.pass ? (
        <div className="verdict approve">
          <div className="verdict-icon">✅</div>
          <h2>APPROVED</h2>
        </div>
      ) : (
        <div className="verdict block">
          <div className="verdict-icon">❌</div>
          <h2>BLOCKED</h2>
        </div>
      )}

      <div className="post-card static">
        <div className="post-card-header">
          <span className="agent-badge">{record.agentName}</span>
        </div>
        <p className="post-text">{record.text}</p>
      </div>

      {!record.policyResult.pass && (
        <div className="failure-list">
          <h3>Policy failures</h3>
          <ul>
            {record.policyResult.failures.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="signature-block">
        <div className="signature-label">Verified by Parmana</div>
        <code className="signature-value">{shortSig}</code>
        <div className="audit-id">Audit record: {record.id}</div>
      </div>

      <div className="tamper-demo">
        <h3>Tamper-proofing demo</h3>
        <p>
          This decision is signed and stored. Try to independently verify it,
          or simulate an attacker editing it directly in storage.
        </p>
        <div className="button-row">
          <button className="btn secondary" onClick={handleVerify}>
            Verify Signature
          </button>
          <button
            className="btn danger"
            onClick={handleTryOverride}
            disabled={tampered}
          >
            {tampered ? "Tampering Simulated" : "Try to Override"}
          </button>
        </div>

        {verifyResult && (
          <div
            className={`verify-result ${verifyResult.valid ? "valid" : "invalid"}`}
          >
            {verifyResult.valid
              ? `✔ Can't override — ${verifyResult.reason}`
              : `✘ Tampering detected — ${verifyResult.reason}`}
          </div>
        )}
      </div>

      <button className="btn primary" onClick={onViewAudit}>
        View Full Audit Trail
      </button>
    </div>
  );
}
