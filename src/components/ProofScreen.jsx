import { useCallback, useEffect, useRef, useState } from "react";
import { generatePost } from "../lib/generatePostClient";
import { describeResult } from "../lib/explain";
import styles from "../styles/Proof.module.css";

const AGENT_SEQUENCE = ["postguard", "contentbot", "postguard", "contentbot"];

export function ProofScreen({ policyEngine, onNavigate }) {
  const [status, setStatus] = useState("loading"); // loading -> ready -> error
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const runId = useRef(0);

  const run = useCallback(() => {
    const id = ++runId.current;
    setStatus("loading");
    setError(null);

    Promise.all(AGENT_SEQUENCE.map((agentId) => generatePost(agentId)))
      .then((generated) => {
        if (id !== runId.current) return;
        setPosts(generated);
        setStatus("ready");
      })
      .catch((err) => {
        if (id !== runId.current) return;
        setError(err.message);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    // Intentional fetch-on-mount: run() kicks off real network calls to
    // /api/generate-post, not a synchronous state update.
    // oxlint-disable-next-line react/set-state-in-effect
    run();
  }, [run]);

  return (
    <div className="page">
      <div className={styles.wrap}>
        <div className={styles.navRow}>
          <button className="btn link" onClick={() => onNavigate("demo")}>
            ← Back
          </button>
          <button className="btn link" onClick={() => onNavigate("hook")}>
            Start over ↑
          </button>
        </div>

        <h2 className={styles.title}>Real examples from AI agents</h2>

        {status === "loading" && (
          <div className="spinner" role="status" aria-label="Generating examples" />
        )}

        {status === "error" && (
          <>
            <p>Couldn't reach the AI service.</p>
            <p className={styles.exampleReason}>{error}</p>
            <button className="btn primary" onClick={run}>
              Try again
            </button>
          </>
        )}

        {status === "ready" && (
          <ul className={styles.exampleList}>
            {posts.map((post, i) => {
              // Real evaluation per example — nothing here is a hardcoded
              // pass/fail baked into the generated text.
              const result = policyEngine.evaluate(post);
              return (
                <li key={i} className={styles.exampleCard}>
                  <span className={styles.exampleIcon}>
                    {result.pass ? "✅" : "❌"}
                  </span>
                  <div className={styles.exampleBody}>
                    <span className="agent-badge">{post.agentName}</span>
                    <p className={styles.exampleText}>&ldquo;{post.text}&rdquo;</p>
                    <p className={styles.exampleReason}>
                      {describeResult(post, result)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.summary}>
          <p className={styles.summaryTitle}>This is how Parmana works:</p>
          <p className={styles.summaryLine}>Every AI action verified.</p>
          <p className={styles.summaryLine}>Every decision signed.</p>
          <p className={styles.summaryLine}>Every violation locked.</p>
          <p className={styles.summaryLine}>No cheating possible.</p>
        </div>

        {status === "ready" && (
          <button className="btn link" onClick={run}>
            ↻ Generate new examples
          </button>
        )}

        <button
          className={`btn primary large ${styles.cta}`}
          onClick={() => onNavigate("hook")}
        >
          Protect my brand ↓
        </button>
      </div>
    </div>
  );
}
