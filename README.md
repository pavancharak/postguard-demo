# PostGuard

A live demo of Parmana's core loop: authorize execution, sign the result, audit everything.

Not a mockup. Every screen is backed by a real policy engine, real HMAC-SHA256 signatures,
and a real tamper-evident audit trail. Nothing on screen is scripted or hardcoded per post.

---

## The problem

AI agents are starting to post, publish, and act on their own. Once that happens, three
questions become unavoidable:

1. Did this action actually follow the rules, or did something just wave it through?
2. Can you prove it after the fact? Not "trust me," but cryptographically.
3. If someone edits the record later (a compromised client, an over privileged admin,
   a bad database write), will anyone notice?

Most agent demos answer none of these. A post either shows a green checkmark because a
human decided it should, or a badge that says "verified" with nothing behind it. That's a
UI opinion, not a guarantee.

## The solution

PostGuard runs every AI-agent post through three real, independently testable layers:

| Layer | File | Job |
|---|---|---|
| Authorization | `src/lib/auth.js` | `PolicyEngine.evaluate()` checks a post against real rules (weekday, profanity, length, required hashtag) and returns an actual pass/fail, never a pre-baked answer. |
| Cryptography | `src/lib/crypto.js` | `SignatureService` signs the decision with real HMAC-SHA256 (`crypto-js`), over a canonicalized (key sorted) payload, so the same decision always produces the same signature. |
| Audit | `src/lib/audit.js` | `AuditStore` persists every signed decision to `localStorage` and `verify()` recomputes the HMAC from the stored fields. It never just reads back a "valid: true" flag. |

Nothing about the verdict is decided by which post you clicked. `PolicyEngine` never sees a
post's id, only its `text` and `timestamp`. Change the text, and the outcome changes with it.

## Why

The point isn't that this app has a checkmark. It's that the checkmark is backed by
something that would fail if you lied to it. That's the difference between a demo that
looks trustworthy and one that mechanically is, and it's the reason to build the
authorization, signing, and audit steps as three separate, swappable pieces instead of one
opaque "approve" function.

## How it works

The app is a 3 screen narrative rather than a browse and verify tool. Each screen exists
to answer one question:

1. Hook (`src/components/HookScreen.jsx`): "Can AI cheat your policy?" No setup, no
   options, one button forward. This is the value proposition, stated plainly, in the
   first five seconds.
2. Demo (`src/components/DemoScreen.jsx`): a single AI post ("Just shipped v2.0. This
   sucks anyway. #startup") runs through the real pipeline in front of you.
   * `policyEngine.evaluate(post)` runs for real, right here, not upstream
   * `auditStore.record(decision)` internally calls `sigService.sign(...)` and writes the
     signed record to `localStorage`
   * the result you see (BLOCKED, with the actual reason) is `policyResult.pass`/
     `.checks`, translated into plain language by `src/lib/explain.js`, never a hardcoded
     string per post
3. Proof (`src/components/ProofScreen.jsx`): four more posts (`src/exampleData.js`), each
   independently run through `policyEngine.evaluate()` live, mixing approved and blocked
   outcomes to show the same rules hold up every time, not just for the one demo post.

`RULES` (`src/lib/constants.js`) still declares the four checks; `PolicyEngine` still
enforces them the same way regardless of which screen calls it.

## What this enables

* Deterministic authorization: the same post and rules always produce the same verdict,
  so "why was this blocked" always has a real answer (`failures[]`).
* Non repudiable decisions: once signed, a decision can't be silently changed without
  the signature breaking, a stronger guarantee than an audit log that just trusts its own rows.
* A real, checkable claim: the Demo screen states plainly that the decision is
  cryptographically sealed. That claim is backed by working code in `src/lib/audit.js`,
  not asserted for effect. See the `localStorage` question below for how to check it
  yourself.
* A pattern that generalizes: swap `PolicyEngine`'s rules for anything (spend limits,
  content policy, code deploy gates) and the sign/audit machinery underneath doesn't change.

## Other questions people ask

**Couldn't this just be faked with a hardcoded `if (postId === ...)`?**
No. `PolicyEngine.evaluate()` never receives a post id, only `text`/`timestamp`, and the
audit trail's `verify()` recomputes the HMAC from the record's current contents rather than
trusting a stored boolean. You can confirm this by reading `src/lib/auth.js` and
`src/lib/audit.js` directly, or by editing a record's `text` in `localStorage` and watching
`verify()` fail.

**Where does `SIGNING_KEY` actually live?**
In this browser only demo, `src/lib/constants.js` (client bundles can't truly hide a
secret). In a production Parmana deployment, this key lives only in a backend signer
service; no agent, and no client code, ever holds it. The demo approximates that boundary
at the module level: only `src/lib/crypto.js` performs signing operations with the key,
though `src/App.jsx` does need to read it once to construct the shared `SignatureService`
instance at startup.

**What happens if I edit `localStorage` by hand? There's no "Verify" button anymore.**
The 3 screen narrative intentionally states the tamper guarantee as plain text instead of
hiding it behind a click, so there's no UI button that re-runs `verify()` on demand
anymore. The underlying code is still real and unchanged: open DevTools, go to
Application then Local Storage then `audit_trail`, and you'll see the actual signed
records `auditStore.record()` wrote. Edit any field and call
`auditStore.verify(id)` from `src/lib/audit.js` against it (for example, from a quick
script or the console with the module imported) and it reports a signature mismatch,
because it recomputes the HMAC from scratch rather than trusting a stored flag.

**Why `crypto-js` instead of Node's `crypto`?**
This demo runs entirely client side (no backend) so it can be a single page hackathon
walkthrough. Node's `crypto` module doesn't run in the browser; `crypto-js` does the same
HMAC-SHA256 math and ships to the client safely since it's not a secret itself. The key is.

**Does this scale past a demo?**
The three layer split (authorize, sign, audit) is the actual production shape. What
changes moving to production: `SIGNING_KEY` moves to a backend signer service, `AuditStore`
moves off `localStorage` onto durable storage, and `PolicyEngine`'s four rules become
whatever policy set the deployment needs. The interfaces (`evaluate`, `sign`/`verify`,
`record`/`verify`) don't need to change.

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
