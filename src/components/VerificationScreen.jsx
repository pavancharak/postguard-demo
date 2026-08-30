import { useEffect } from "react";

function formatMeta(ts) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VerificationScreen({ post, onRunVerification }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRunVerification(post);
    }, 1600);
    return () => clearTimeout(timer);
  }, [post, onRunVerification]);

  return (
    <div className="screen verify-screen">
      <h2 className="verify-heading">Checking your rules…</h2>

      <p className="verify-quote">&ldquo;{post.text}&rdquo;</p>

      <div className="spinner" role="status" aria-label="Verifying" />

      <div className="verify-meta">
        {post.agentName} · {formatMeta(post.timestamp)}
      </div>

      <p className="verify-footnote">
        Parmana verifies every action cryptographically.
      </p>
    </div>
  );
}
