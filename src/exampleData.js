// Curated examples for the Demo and Proof screens. Raw post data only — no
// pass/fail baked in. PolicyEngine.evaluate() decides the outcome for real,
// every time these render.
export const demoPost = {
  id: "demo_bad_001",
  agentName: "ContentBot AI",
  text: "Just shipped v2.0. This sucks anyway. #startup",
  timestamp: "2024-02-05T16:15:00", // Monday — only profanity should fail
};

export const proofExamples = [
  {
    id: "proof_001",
    agentName: "PostGuard AI",
    text: "Building future of AI security. #startup",
    timestamp: "2024-02-05T09:30:00", // Monday
  },
  {
    id: "proof_002",
    agentName: "ContentBot AI",
    text: "Check this recipe for pasta",
    timestamp: "2024-02-06T11:00:00", // Tuesday — missing #startup
  },
  {
    id: "proof_003",
    agentName: "GrowthBot AI",
    text: "Partnership with Mastercard. Execution governance real. #startup",
    timestamp: "2024-02-07T14:00:00", // Wednesday
  },
  {
    id: "proof_004",
    agentName: "LaunchBot AI",
    text: "Weekend recap: shipped three features and fixed a bug. #startup",
    timestamp: "2024-02-10T10:00:00", // Saturday — weekend
  },
];
