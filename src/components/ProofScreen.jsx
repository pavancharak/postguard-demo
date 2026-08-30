import { proofExamples } from "../exampleData";
import { describeResult } from "../lib/explain";
import styles from "../styles/Proof.module.css";

export function ProofScreen({ policyEngine, onNavigate }) {
  return (
    <div className="page">
      <div className={styles.wrap}>
        <div className={styles.navRow}>
          <button className="btn link" onClick={() => onNavigate("demo")}>
            ← Back to demo
          </button>
          <button className="btn link" onClick={() => onNavigate("hook")}>
            Start over ↑
          </button>
        </div>

        <h2 className={styles.title}>It works the same every time</h2>

        <ul className={styles.exampleList}>
          {proofExamples.map((post) => {
            // Real evaluation per example — nothing here is a hardcoded
            // pass/fail baked into the example data.
            const result = policyEngine.evaluate(post);
            return (
              <li key={post.id} className={styles.exampleCard}>
                <span className={styles.exampleIcon}>
                  {result.pass ? "✅" : "❌"}
                </span>
                <div className={styles.exampleBody}>
                  <p className={styles.exampleText}>&ldquo;{post.text}&rdquo;</p>
                  <p className={styles.exampleReason}>
                    {describeResult(post, result)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.summary}>
          <p className={styles.summaryTitle}>This is how Parmana works:</p>
          <p className={styles.summaryLine}>Every AI action verified.</p>
          <p className={styles.summaryLine}>Every decision signed.</p>
          <p className={styles.summaryLine}>Every violation locked.</p>
          <p className={styles.summaryLine}>No cheating possible.</p>
        </div>

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
