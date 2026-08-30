import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { AGENTS } from "./agents.js";

const MODEL = "gpt-4o";

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

// Some agents (see agents.js) declare multiple instruction variants instead
// of one fixed prompt, each with a weight. Picking the variant here (in code)
// rather than asking the model to self-randomize is deliberate — see the
// comment on ContentBot in agents.js for why.
export function pickInstructions(agent) {
  if (!agent.variants) return agent.instructions;
  const total = agent.variants.reduce((sum, v) => sum + v.weight, 0);
  let roll = Math.random() * total;
  for (const variant of agent.variants) {
    roll -= variant.weight;
    if (roll <= 0) return variant.instructions;
  }
  return agent.variants[agent.variants.length - 1].instructions;
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

  const key = process.env.OPENAI_API_KEY;
  console.log(
    `[generate-post] agentId=${body.agentId} model=${MODEL} ` +
      `keyPresent=${Boolean(key)} keyPrefix=${key ? key.slice(0, 8) : "n/a"}`
  );

  try {
    const { text } = await generateText({
      model: openai(MODEL),
      instructions: pickInstructions(agent),
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
    // AI SDK errors (APICallError and friends: auth, invalid request, rate
    // limit, ...) carry the real statusCode/name/type — surface those
    // instead of flattening every failure into a generic 502, so the actual
    // cause (bad key vs bad model id vs rate limited vs network) is visible
    // without digging through server logs.
    const status = typeof err?.statusCode === "number" ? err.statusCode : 502;
    return sendJson(res, status, {
      error: "AI generation failed",
      name: err?.name,
      type: err?.type,
      detail: String(err?.message || err),
    });
  }
}
