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

Follow one post end to end:

1. Drafts: a raw, unverified post from an AI agent (see `src/data.js`; no pass/fail baked
   in, on purpose).
2. Verify: shows the four rules about to be checked (`RULES` in `src/lib/constants.js`).
3. Receipt (`src/components/ReceiptScreen.jsx`): on mount, it
   * calls `policyEngine.evaluate(post)` for real rule evaluation, happening here, not upstream
   * builds a decision object and calls `auditStore.record(decision)`, which internally
     calls `sigService.sign(...)` and writes the signed record to `localStorage`
   * renders the real `pass`/`failures` from that evaluation, plus the first 16 hex
     characters of the signature
4. Try to Override: this button doesn't fake a rejection message. It calls
   `auditStore.tamper(id, { policyResult: { pass: true } })`, which directly mutates the
   stored record the way a raw database edit would (bypassing `SignatureService`
   entirely), then calls `auditStore.verify(id)`, which recomputes the HMAC over the
   now mutated record and compares it to the signature computed before the edit.
   Mismatch means "Tampering detected." That's a computed result, not a string someone
   typed into the button handler.
5. Audit Trail: every signed decision this session, each independently re-verifiable
   with its own "Verify" button, calling the same recompute and compare logic.

## What this enables

* Deterministic authorization: the same post and rules always produce the same verdict,
  so "why was this blocked" always has a real answer (`failures[]`).
* Non repudiable decisions: once signed, a decision can't be silently changed without
  the signature breaking, a stronger guarantee than an audit log that just trusts its own rows.
* A visible attack: most demos assert trust; this one lets you break it (edit
  `localStorage` yourself, or click "Try to Override") and watch the system catch it.
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

**What happens if I edit `localStorage` by hand?**
Try it. Open DevTools, go to Application then Local Storage then `audit_trail`, change any
field in a record, then hit "Verify" on that record in the Audit Trail screen. It will
report a signature mismatch. This is the same code path "Try to Override" uses, just
triggered manually instead of through the UI button.

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
