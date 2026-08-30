# PostGuard

AI agents are starting to act on their own. PostGuard is proof that every one of
those actions can be checked, signed, and locked before it goes out, not just logged
after the fact.

## The problem

AI agents post, trade, diagnose, and decide with no runtime check on what actually
happens. Approving an agent once at setup is not the same as verifying every action it
takes. A single unchecked agent can act thousands of times before anyone notices it
broke policy on the very first one.

## The solution

A real policy engine evaluates every AI action against the rules that matter. A real
cryptographic signature seals the decision. A tamper evident audit trail records it.
Nothing here is a UI opinion. Edit a record after the fact and the signature breaks,
provably.

## How it works

1. An AI agent generates an action (a post, a trade, a diagnosis).
2. The policy engine evaluates it against real rules.
3. The decision is signed with HMAC SHA256.
4. The result is locked in: approved or blocked, either way recorded.

## Market

The same authorize, sign, audit pattern applies anywhere an AI agent's output needs to
be trusted before it acts:

* Content and social: brand policy enforcement on AI generated posts.
* Financial: risk policy checks on AI generated trade orders.
* Healthcare: protocol checks on AI suggested diagnoses.
* Compliance: a provable audit trail for every AI decision, in any regulated industry.

## Business model

License the verification layer (policy engine plus signing plus audit) to companies
deploying AI agents, priced per verified action or per seat. The demo proves the
mechanism; the product is the same three layers running against a customer's own
policies and a customer's own agents.

## Traction

* Working web app and Android app, both running the same real policy engine, real
  signing, and real audit logic, not two separate demos.
* Live AI agents generating real, different output every run, verified in real time,
  not scripted per example.
* A public landing page with a downloadable APK for hands on demoing.

## Ask

Looking for design partners in one of the markets above to pilot the verification
layer against a real policy and a real agent.

---

Technical documentation, setup, and architecture details live in the codebase and in
`postguard-landing`; this file is intentionally kept to the business case.
