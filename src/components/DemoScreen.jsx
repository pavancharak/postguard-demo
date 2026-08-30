import { useCallback, useEffect, useRef, useState } from "react";
import { generatePost } from "../lib/generatePostClient";
import { describeResult } from "../lib/explain";
import styles from "../styles/Demo.module.css";

// Weighted toward ContentBot so repeatedly tapping "Generate another" is
// likely to surface both outcomes, not just PostGuard's near-always-approved
// posts. PostGuard still appears often enough to read as "usually approved"
// rather than never showing up.
function pickAgentId() {
  return Math.random() < 0.35 ? "postguard" : "contentbot";
}

export function DemoScreen({ policyEngine, auditStore, onNavigate }) {
  const [stage, setStage] = useState("drafting"); // drafting -> checking -> result -> error
  const [post, setPost] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const runId = useRef(0);

  const run = useCallback(() => {
    const id = ++runId.current;
    setStage("drafting");
    setPost(null);
    setResult(null);
    setError(null);

    generatePost(pickAgentId())
      .then((generated) => {
        if (id !== runId.current) return; // a newer run superseded this one
        setPost(generated);
        setStage("checking");

        // Artificial pacing only — PolicyEngine.evaluate() itself is
        // synchronous and instant.
        setTimeout(() => {
          if (id !== runId.current) return;

          // LAYER 1 — real policy evaluation on real AI-generated text.
          const policyResult = policyEngine.evaluate(generated);

          // LAYER 2 + 3 — real HMAC signature + persisted audit record.
          auditStore.record({
            postId: `demo_${Date.now()}`,
            agentName: generated.agentName,
            text: generated.text,
            timestamp: generated.timestamp,
            policyResult,
            verifiedAt: new Date().toISOString(),
          });

          setResult(policyResult);
          setStage("result");
        }, 1400);
      })
      .catch((err) => {
        if (id !== runId.current) return;
        setError(err.message);
        setStage("error");
      });
  }, [policyEngine, auditStore]);

  useEffect(() => {
    // Intentional fetch-on-mount: run() kicks off the real network call to
    // /api/generate-post, not a synchronous state update.
    // oxlint-disable-next-line react/set-state-in-effect
    run();
  }, [run]);

  return (
    <div className="page">
      <p className={styles.eyebrow}>
        {stage === "drafting" ? "An AI agent is drafting…" : "AI wants to post this"}
      </p>

      {post && (
        <div className="post-card">
          <span className="agent-badge">{post.agentName}</span>
          <p className="post-text">&ldquo;{post.text}&rdquo;</p>
        </div>
      )}

      <div className={styles.stage}>
        {stage === "drafting" && (
          <div className="spinner" role="status" aria-label="Generating post" />
        )}

        {stage === "checking" && (
          <>
            <div className="spinner" role="status" aria-label="Verifying" />
            <p className={styles.checkingText}>PostGuard is checking…</p>
          </>
        )}

        {stage === "error" && (
          <>
            <p className={styles.reason}>Couldn't reach the AI service.</p>
            <p className={styles.checkingText}>{error}</p>
            <button className="btn primary" onClick={run}>
              Try again
            </button>
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
            <p className={styles.reason}>{describeResult(post, result)}</p>
            <div className={styles.trustBox}>
              This decision is locked with a cryptographic proof. Try to
              change it → can't. It's mathematically sealed.
            </div>
          </>
        )}
      </div>

      {stage === "result" && (
        <div className={styles.navRow}>
          <button className="btn link" onClick={run}>
            ↻ Generate another
          </button>
          <button className="btn link" onClick={() => onNavigate("proof")}>
            See more examples →
          </button>
        </div>
      )}
    </div>
  );
}
