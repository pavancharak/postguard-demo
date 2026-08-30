// Translates a real PolicyEngine result into a single plain-language line.
// Never decides pass/fail itself — it only describes what evaluate() already
// decided, so the copy can never drift from the actual enforcement logic.
export function describeResult(post, result) {
  if (result.pass) return "All rules pass";

  if (!result.checks.profanity) {
    const word = result.matchedProfanity ? `'${result.matchedProfanity}'` : "profanity";
    return `Uses profanity (${word}). Your policy prohibits it.`;
  }
  if (!result.checks.hashtag) {
    return "Missing #startup tag. Your policy requires it.";
  }
  if (!result.checks.length) {
    return `Too long at ${post.text.length} characters. Your policy caps it at 280.`;
  }
  if (!result.checks.weekday) {
    return "Posted on a weekend. Your policy is weekdays only.";
  }
  return "Blocked by policy.";
}
