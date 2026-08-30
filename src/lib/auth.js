// src/lib/auth.js
//
// PolicyEngine: the authorization layer. It takes a set of declared rules
// and actually evaluates a post against them — no pre-baked pass/fail ever
// comes in from data.js. This is the thing standing between "an AI agent
// wants to post" and "the post goes out."
const PROFANITY_PATTERN = /\b(sucks|shit|damn|hell)\b/i;
const MAX_LENGTH = 280;
const REQUIRED_HASHTAG = "#startup";

export class PolicyEngine {
  constructor(rules) {
    this.rules = rules;
  }

  /**
   * Evaluate a post against every policy rule.
   * @param {{ text: string, timestamp: string }} post
   * @returns {{ pass: boolean, failures: string[], checks: Record<string, boolean> }}
   */
  evaluate(post) {
    const results = {
      pass: true,
      failures: [],
      checks: {},
    };

    // Rule 1: Weekday check (Mon–Fri only)
    const date = new Date(post.timestamp);
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekday = day !== 0 && day !== 6;
    results.checks.weekday = isWeekday;
    if (!isWeekday) {
      results.pass = false;
      results.failures.push("Posted on weekend (must be weekday)");
    }

    // Rule 2: No profanity
    const hasProfanity = PROFANITY_PATTERN.test(post.text);
    results.checks.profanity = !hasProfanity;
    if (hasProfanity) {
      results.pass = false;
      results.failures.push("Contains profanity");
    }

    // Rule 3: Max character count
    const withinLength = post.text.length <= MAX_LENGTH;
    results.checks.length = withinLength;
    if (!withinLength) {
      results.pass = false;
      results.failures.push(
        `Too long: ${post.text.length} chars (max ${MAX_LENGTH})`
      );
    }

    // Rule 4: Required hashtag
    const hasHashtag = post.text.includes(REQUIRED_HASHTAG);
    results.checks.hashtag = hasHashtag;
    if (!hasHashtag) {
      results.pass = false;
      results.failures.push(`Missing ${REQUIRED_HASHTAG} tag`);
    }

    return results;
  }
}
