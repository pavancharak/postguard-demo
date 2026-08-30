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
    throw new Error(data.error || "AI generation failed");
  }
  return data; // { agentId, agentName, text, timestamp }
}
