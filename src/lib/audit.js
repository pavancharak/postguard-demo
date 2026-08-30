// src/lib/audit.js
//
// AuditStore: the immutable(-ish) trail. Every verification decision is
// persisted to localStorage *with* a cryptographic signature over its
// contents. `verify()` re-derives the signature from the stored fields and
// compares it against what was signed at record time — it never just trusts
// a "verified" flag sitting in storage. `tamper()` exists purely for the
// demo: it edits a stored record directly (the way a database admin or a
// compromised client could), bypassing SignatureService entirely, so you can
// then prove `verify()` catches it.
const STORAGE_KEY = "audit_trail";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export class AuditStore {
  constructor(sigService) {
    this.sigService = sigService;
    this.records = loadFromStorage();
  }

  /**
   * Store a signed decision.
   * decision = { postId, agentName, text, timestamp, policyResult }
   * Returns the full stored record, including its id and audit signature.
   */
  record(decision) {
    const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const fullRecord = {
      id,
      ...decision,
      createdAt: new Date().toISOString(),
    };

    // Sign everything except the signature field itself.
    const signature = this.sigService.sign(fullRecord);
    const signedRecord = { ...fullRecord, auditSignature: signature };

    this.records.push(signedRecord);
    saveToStorage(this.records);
    return signedRecord;
  }

  getAll() {
    return [...this.records];
  }

  get(id) {
    return this.records.find((r) => r.id === id) || null;
  }

  /**
   * Independently verify a stored record's signature. Recomputes the HMAC
   * over the record's current contents and compares against the signature
   * stored alongside it — if anything in the record changed since it was
   * signed, this will fail.
   */
  verify(id) {
    const record = this.get(id);
    if (!record) return { valid: false, reason: "Record not found" };

    const { auditSignature, ...unsigned } = record;
    const isValid = this.sigService.verify(unsigned, auditSignature);
    return {
      valid: isValid,
      reason: isValid
        ? "Signature verified — record matches what was signed"
        : "Signature mismatch — record was tampered with after signing",
    };
  }

  /**
   * DEMO ONLY: simulate an attacker (or an over-privileged admin) directly
   * editing a stored record in place, without going through SignatureService.
   * This is what "try to override" actually does under the hood — it does
   * not fake a UI error, it mutates real localStorage data and then asks
   * verify() to catch it.
   */
  tamper(id, patch) {
    const idx = this.records.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...patch };
    saveToStorage(this.records);
    return this.records[idx];
  }

  clearAll() {
    this.records = [];
    saveToStorage(this.records);
  }
}
