// src/data.js
//
// Raw post data only. No pass/fail, no rule results, no signatures — all of
// that is computed live by PolicyEngine + SignatureService + AuditStore.
export const agents = [
  { id: "agent_postguard", name: "PostGuard AI" },
  { id: "agent_contentbot", name: "ContentBot AI" },
  { id: "agent_growthbot", name: "GrowthBot AI" },
  { id: "agent_launchbot", name: "LaunchBot AI" },
];

export const posts = [
  {
    id: "post_001",
    agentName: "PostGuard AI",
    text: "Building the future of AI verification. Security isn't optional. #startup",
    timestamp: "2024-01-08T09:30:00", // Monday
  },
  {
    id: "post_002",
    agentName: "ContentBot AI",
    text: "Just shipped v2.0. This sucks but the team worked hard. #startup",
    timestamp: "2024-01-09T16:15:00", // Tuesday — profanity
  },
  {
    id: "post_003",
    agentName: "GrowthBot AI",
    text: "Huge milestone today: 10,000 users. Thank you to everyone who believed in us early on. #startup",
    timestamp: "2024-01-10T11:00:00", // Wednesday
  },
  {
    id: "post_004",
    agentName: "LaunchBot AI",
    text: "We're live! Check out the new dashboard and let us know what you think.",
    timestamp: "2024-01-11T14:45:00", // Thursday — missing hashtag
  },
  {
    id: "post_005",
    agentName: "PostGuard AI",
    text: "Weekend recap: shipped three features and fixed a nasty bug. #startup",
    timestamp: "2024-01-13T10:00:00", // Saturday — weekend
  },
  {
    id: "post_006",
    agentName: "ContentBot AI",
    text: "Excited to announce our Series A. More details soon. #startup",
    timestamp: "2024-01-14T08:00:00", // Sunday — weekend
  },
  {
    id: "post_007",
    agentName: "GrowthBot AI",
    text: "What a damn great week for the team. Numbers are up across the board. #startup",
    timestamp: "2024-01-15T13:20:00", // Monday — profanity
  },
  {
    id: "post_008",
    agentName: "LaunchBot AI",
    text: "New blog post is up: how we scaled our infra to handle 100x traffic without breaking a sweat or the bank. #startup",
    timestamp: "2024-01-16T09:00:00", // Tuesday
  },
  {
    id: "post_009",
    agentName: "PostGuard AI",
    text: "Reminder: office hours with the founders this Friday at 3pm ET. Bring your questions. #startup",
    timestamp: "2024-01-17T12:00:00", // Wednesday
  },
  {
    id: "post_010",
    agentName: "ContentBot AI",
    text: "Hell of a launch day. Traffic spiked 40x and the site held up. #startup",
    timestamp: "2024-01-18T17:30:00", // Thursday — profanity
  },
  {
    id: "post_011",
    agentName: "GrowthBot AI",
    text: "A".repeat(260) + " keep reading for more #startup",
    timestamp: "2024-01-19T10:15:00", // Friday — too long
  },
  {
    id: "post_012",
    agentName: "LaunchBot AI",
    text: "Case study: how one customer cut onboarding time from 3 weeks to 3 days using our platform. #startup",
    timestamp: "2024-01-20T15:00:00", // Saturday — weekend
  },
];

export { RULES as rules } from "./lib/constants.js";
