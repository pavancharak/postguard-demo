# PostGuard

A working demo of Parmana's core: **authorize execution, sign the result, audit everything.**

This is not a UI mockup. Every screen is backed by a real authorization layer, real
cryptographic signatures, and a real (tamper-evident) audit trail.

## Layers

| File | Role |
| --- | --- |
| `src/lib/auth.js` | `PolicyEngine` — evaluates a post against brand policy rules (weekday, profanity, length, required hashtag) and returns a real pass/fail result. |
| `src/lib/crypto.js` | `SignatureService` — signs and verifies decisions with real HMAC-SHA256 (via `crypto-js`). |
| `src/lib/audit.js` | `AuditStore` — persists every signed decision to `localStorage` and independently re-verifies a record's signature on demand. |
| `src/lib/constants.js` | Holds the (demo) `SIGNING_KEY` and the declared `RULES`. Only `crypto.js` ever imports the key. |

## Key isolation

In production, `SIGNING_KEY` never ships to a client at all — it lives only in a backend
signer service, and no AI agent ever holds it. This demo runs entirely in the browser for a
single-page hackathon walkthrough, so key isolation is enforced at the *module* boundary
instead: only `src/lib/crypto.js` imports `SIGNING_KEY`. No post data, agent code, or UI
component ever touches it directly.

## Tamper detection

The Receipt screen's "Try to Override" button doesn't fake an error message — it actually
mutates a stored audit record directly in `localStorage` (bypassing `SignatureService`
entirely, the way a raw database edit would), then calls `AuditStore.verify()`, which
recomputes the HMAC from scratch and reports the mismatch.

## Screens

1. **Home** — live stats pulled from the real audit trail.
2. **Drafts** — a list of unverified AI-agent posts.
3. **Verify** — runs `PolicyEngine.evaluate()` against the declared rules.
4. **Receipt** — the technical heart: shows the real pass/fail verdict, signs the decision,
   stores it, and lets you try to tamper with it.
5. **Audit Trail** — every signed decision this session, each independently re-verifiable.

## Run it

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
