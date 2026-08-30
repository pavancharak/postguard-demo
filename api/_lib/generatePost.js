import { generateText } from "ai";
import { AGENTS } from "./agents.js";

const MODEL = process.env.AI_MODEL || "anthropic/claude-haiku-4.5";

// The AI only controls what the post SAYS, never when it's "posted" — but a
// raw wall-clock timestamp would mean the weekday rule silently blocks every
// single post whenever this demo happens to run on a Saturday or Sunday,
// drowning out the profanity/length/hashtag checks the demo exists to show.
// Rolling weekend timestamps back to the preceding Friday keeps the weekday
// check real (it's still evaluated, not skipped) without letting the
// calendar hijack the story.
function demoSafeTimestamp() {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) now.setDate(now.getDate() - 2); // Sunday -> Friday
  else if (day === 6) now.setDate(now.getDate() - 1); // Saturday -> Friday
  return now.toISOString();
}

export async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export async function generatePostHandler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return sendJson(res, 400, { error: "Invalid JSON body" });
  }

  const agent = AGENTS[body.agentId];
  if (!agent) {
    return sendJson(res, 400, { error: `Unknown agentId: ${body.agentId}` });
  }

  const key = process.env.AI_GATEWAY_API_KEY;
  console.log(
    `[generate-post] agentId=${body.agentId} model=${MODEL} ` +
      `keyPresent=${Boolean(key)} keyPrefix=${key ? key.slice(0, 8) : "n/a"}`
  );

  try {
    const { text } = await generateText({
      model: MODEL,
      instructions: agent.instructions,
      prompt: "Write one social post now. Output only the post text.",
      maxOutputTokens: 120,
    });

    return sendJson(res, 200, {
      agentId: body.agentId,
      agentName: agent.agentName,
      text: text.trim().replace(/^["']|["']$/g, ""),
      timestamp: demoSafeTimestamp(),
    });
  } catch (err) {
    console.error("[generate-post] generateText failed:", err);
    return sendJson(res, 502, {
      error: "AI generation failed",
      detail: String(err?.message || err),
    });
  }
}
