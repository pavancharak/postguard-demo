// src/lib/constants.js
//
// DEMO NOTE ON KEY ISOLATION:
// In a real Parmana deployment, SIGNING_KEY never ships to the client at all —
// it lives only in a backend signer service. AI agents (and even the UI that
// requests verification) only ever see the *result* of a signature, never the
// key that produced it. For this hackathon demo, everything runs in the
// browser for a single-page walkthrough, so the key is isolated at the
// *module* boundary instead: only crypto.js imports SIGNING_KEY. No agent
// code, no post data, and no UI component ever touches it directly.
export const SIGNING_KEY = "parmana-demo-signing-key-do-not-ship-to-prod-v1";

// Policy rules enforced by the PolicyEngine. Each rule is documented here so
// the UI can render "what will be checked" without duplicating the logic
// that lives in auth.js.
export const RULES = [
  { id: "weekday", text: "Posted on a weekday (Mon–Fri)" },
  { id: "profanity", text: "No profanity" },
  { id: "length", text: "Max 280 characters" },
  { id: "hashtag", text: "Must contain #startup" },
];
