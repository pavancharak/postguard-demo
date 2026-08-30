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

export function DraftsScreen({ onNavigate, onSelectPost }) {
  return (
    <div className="screen drafts-screen">
      <button className="btn link back" onClick={() => onNavigate("home")}>
        ← Back
      </button>
      <h2 className="screen-title">Browse AI Drafts</h2>
      <p className="subtitle">
        These posts are waiting on your brand policy. Tap one to check it.
      </p>

      <ul className="post-list">
        {posts.map((post) => (
          <li key={post.id}>
            <button
              className="post-card post-card-tap"
              onClick={() => onSelectPost(post)}
            >
              <div className="post-card-header">
                <span className="agent-badge">{post.agentName}</span>
                <span className="post-date">{formatDate(post.timestamp)}</span>
              </div>
              <p className="post-text">{post.text}</p>
              <div className="post-card-footer">
                <span className="tap-hint">Tap to verify →</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
