import { posts } from "../data";

function formatDate(ts) {
  return new Date(ts).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function DraftsScreen({ verifiedIds, onNavigate, onSelectPost }) {
  return (
    <div className="screen drafts-screen">
      <button className="btn link back" onClick={() => onNavigate("home")}>
        ← Back
      </button>
      <h2>Drafted Posts</h2>
      <p className="subtitle">
        Nothing here has been checked yet. Tap a post to run it through the
        policy engine.
      </p>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id} className="post-card">
            <div className="post-card-header">
              <span className="agent-badge">{post.agentName}</span>
              <span className="post-date">{formatDate(post.timestamp)}</span>
            </div>
            <p className="post-text">{post.text}</p>
            <div className="post-card-footer">
              {verifiedIds.has(post.id) ? (
                <span className="tag verified">Verified</span>
              ) : (
                <span className="tag pending">Pending</span>
              )}
              <button
                className="btn primary small"
                onClick={() => onSelectPost(post)}
              >
                Verify Post
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
