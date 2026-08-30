import { useEffect, useRef, useState } from "react";

function dayName(ts) {
  return new Date(ts).toLocaleDateString(undefined, { weekday: "long" });
}

function timeOnly(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildRuleRows(post, checks) {
  const rows = [
    {
      id: "weekday",
      pass: checks.weekday,
      text: checks.weekday
        ? `Weekday (${dayName(post.timestamp)})`
        : `Posted on ${dayName(post.timestamp)} (weekdays only)`,
    },
    {
      id: "profanity",
      pass: checks.profanity,
      text: checks.profanity ? "No profanity" : "Contains profanity",
    },
    {
      id: "length",
      pass: checks.length,
      text: checks.length
        ? `${post.text.length} characters`
        : `Too long — ${post.text.length} characters (max 280)`,
    },
    {
      id: "hashtag",
      pass: checks.hashtag,
      text: checks.hashtag ? "Has #startup tag" : "Missing #startup tag",
    },
  ];
  // Show what went wrong first, then what was fine — matches how a person
  // scans a failed checklist.
  return [...rows].sort((a, b) => Number(a.pass) - Number(b.pass));
}

export function ReceiptScreen({
  post,
  policyEngine,
  auditStore,
  onBack,
  onViewAudit,
  onRecorded,
}) {
  const [record, setRecord] = useState(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideResult, setOverrideResult] = useState(null);
  const tamperedRef = useRef(false);
  const processedPostId = useRef(null);

  useEffect(() => {
    if (processedPostId.current === post.id) return;
    processedPostId.current = post.id;

    // LAYER 1 — Authorization: real policy evaluation, not mock data.
    const policyResult = policyEngine.evaluate(post);

    // LAYER 2 + 3 — Cryptography + Audit: AuditStore.record() internally
    // signs the full decision with SignatureService and persists it to
    // localStorage.
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

  const passed = record.policyResult.pass;
  const shortSig = `sig_${record.auditSignature.slice(0, 12)}`;
  const ruleRows = buildRuleRows(record, record.policyResult.checks);

  const handleTryOverride = () => {
    if (!tamperedRef.current) {
      // This is a real attack simulation, not a scripted message: it
      // mutates the stored record directly (bypassing SignatureService),
      // then asks AuditStore to independently re-verify it.
      auditStore.tamper(record.id, {
        policyResult: { pass: true, failures: [], checks: {} },
      });
      tamperedRef.current = true;
      const result = auditStore.verify(record.id);
      setOverrideResult(result);
    }
    setShowOverrideModal(true);
  };

  return (
    <div className="screen receipt-screen">
      {passed ? (
        <div className="verdict-hero approve">
          <div className="verdict-icon">✅</div>
          <h1>APPROVED</h1>
          <p>This post passes your brand policy.</p>
        </div>
      ) : (
        <div className="verdict-hero block">
          <div className="verdict-icon">❌</div>
          <h1>NOT APPROVED</h1>
          <p>This violates your brand policy. AI can't post it.</p>
        </div>
      )}

      <p className="receipt-post">
        <strong>{record.agentName}</strong> — &ldquo;{record.text}&rdquo;
      </p>

      <div className="rules-checked">
        <h3>Rules checked</h3>
        {ruleRows.map((row) => (
          <div
            key={row.id}
            className={`rule-row ${row.pass ? "pass" : "fail"}`}
          >
            <span className="mark">{row.pass ? "✓" : "✗"}</span>
            <span>{row.text}</span>
          </div>
        ))}
      </div>

      <div className="signature-block">
        <div className="signature-label">Verified by Parmana</div>
        <code className="signature-value">
          {shortSig}… · {timeOnly(record.createdAt)}
        </code>
        <div className="audit-id">Record {record.id}</div>
      </div>

      <div className="receipt-actions">
        <button className="btn danger full" onClick={handleTryOverride}>
          Try to Override
        </button>
        <button className="btn secondary" onClick={onBack}>
          ← Back
        </button>
      </div>

      <button className="btn link audit-link" onClick={onViewAudit}>
        View full audit trail →
      </button>

      {showOverrideModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowOverrideModal(false)}
        >
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h2>Can't Change It</h2>
            <p>
              This decision is sealed with a cryptographic signature. It
              can't be altered or faked.
            </p>
            <p>
              We just tried to flip it to approved directly in storage — the
              way an attacker, or an over-privileged admin, could. Here's
              what Parmana's audit check found:
            </p>
            <div className="modal-proof">
              {overrideResult
                ? `${overrideResult.valid ? "✔" : "✘"} ${overrideResult.reason}`
                : "Checking…"}
            </div>
            <p className="modal-tagline">That's how Parmana works.</p>
            <button
              className="btn primary large"
              onClick={() => setShowOverrideModal(false)}
            >
              ← Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
