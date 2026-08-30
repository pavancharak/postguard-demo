// Client-side call to the real AI generation endpoint (api/generate-post.js).
// The system prompts and API key live server-side only — this just relays
// { agentId } and gets back real generated text.
export async function generatePost(agentId) {
  const res = await fetch("/api/generate-post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId }),
  });
  const data = await res.json();
  if (!res.ok) {
    // Surface the real cause (e.g. "AI Gateway authentication failed:
    // Invalid API key") instead of the generic top-level error string, so
    // the UI's error state is actually diagnostic.
    throw new Error(data.detail || data.error || "AI generation failed");
  }
  return data; // { agentId, agentName, text, timestamp }
}
