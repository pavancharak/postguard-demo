import { useEffect, useRef, useState } from "react";
import { demoPost } from "../exampleData";
import { describeResult } from "../lib/explain";
import styles from "../styles/Demo.module.css";

export function DemoScreen({ policyEngine, auditStore, onNavigate }) {
  const [stage, setStage] = useState("show"); // show -> checking -> result
  const [result, setResult] = useState(null);
  const recorded = useRef(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage("checking"), 1100);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (stage !== "checking") return;
    const t2 = setTimeout(() => {
      // LAYER 1 — real policy evaluation, not a hardcoded verdict.
      const policyResult = policyEngine.evaluate(demoPost);

      // LAYER 2 + 3 — real HMAC signature + persisted, tamper-evident record.
      if (!recorded.current) {
        recorded.current = true;
        auditStore.record({
          postId: demoPost.id,
          agentName: demoPost.agentName,
          text: demoPost.text,
          timestamp: demoPost.timestamp,
          policyResult,
          verifiedAt: new Date().toISOString(),
        });
      }

      setResult(policyResult);
      setStage("result");
    }, 2000);
    return () => clearTimeout(t2);
  }, [stage, policyEngine, auditStore]);

  return (
    <div className="page">
      <p className={styles.eyebrow}>AI wants to post this</p>

      <div className="post-card">
        <span className="agent-badge">{demoPost.agentName}</span>
        <p className="post-text">&ldquo;{demoPost.text}&rdquo;</p>
      </div>

      <div className={styles.stage}>
        {stage === "show" && (
          <p className={styles.checkingText}>Getting ready…</p>
        )}

        {stage === "checking" && (
          <>
            <div className="spinner" role="status" aria-label="Verifying" />
            <p className={styles.checkingText}>PostGuard is checking…</p>
          </>
        )}

        {stage === "result" && result && (
          <>
            <div className={`verdict-icon giant ${styles.resultIcon}`}>
              {result.pass ? "✅" : "❌"}
            </div>
            <h2
              className={`${styles.resultTitle} status-line ${
                result.pass ? "approve" : "block"
              }`}
            >
              {result.pass ? "APPROVED" : "BLOCKED"}
            </h2>
            <p className={styles.reason}>{describeResult(demoPost, result)}</p>
            <div className={styles.trustBox}>
              This decision is locked with a cryptographic proof. Try to
              change it → can't. It's mathematically sealed.
            </div>
          </>
        )}
      </div>

      {stage === "result" && (
        <div className={styles.navRow}>
          <button className="btn link" onClick={() => onNavigate("hook")}>
            ← Back to hook
          </button>
          <button className="btn link" onClick={() => onNavigate("proof")}>
            See more examples →
          </button>
        </div>
      )}
    </div>
  );
}
