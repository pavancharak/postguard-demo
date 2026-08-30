import { useState } from "react";
import { RULES } from "../lib/constants";

export function VerificationScreen({ post, onBack, onRunVerification }) {
  const [checking, setChecking] = useState(false);

  const handleVerify = () => {
    setChecking(true);
    // Small artificial delay so the "checking rules" state is visible in the
    // demo. The actual PolicyEngine.evaluate() call happens synchronously —
    // this timeout is purely UI pacing, not part of the authorization logic.
    setTimeout(() => {
      onRunVerification(post);
    }, 700);
  };

  return (
    <div className="screen verification-screen">
      <button className="btn link back" onClick={onBack}>
        ← Back
      </button>
      <h2>Verify Post</h2>

      <div className="post-card static">
        <div className="post-card-header">
          <span className="agent-badge">{post.agentName}</span>
        </div>
        <p className="post-text">{post.text}</p>
      </div>

      <div className="rule-checklist">
        <h3>Policy rules to be checked</h3>
        <ul>
          {RULES.map((rule) => (
            <li key={rule.id} className={checking ? "checking" : ""}>
              {rule.text}
            </li>
          ))}
        </ul>
      </div>

      <button
        className="btn primary large"
        onClick={handleVerify}
        disabled={checking}
      >
        {checking ? "Running PolicyEngine…" : "Run Verification"}
      </button>
    </div>
  );
}
