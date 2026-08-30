// src/lib/crypto.js
//
// Real HMAC-SHA256 signing, done client-side with crypto-js (Node's `crypto`
// module doesn't run in the browser). This is the only file in the app that
// ever touches SIGNING_KEY — auth.js, audit.js UI, and every React component
// only ever see signatures, never the key.
import CryptoJS from "crypto-js";

// Canonicalize an object into a stable JSON string so that key order never
// affects the signature (JS objects generally preserve insertion order, but
// we sort explicitly so re-serializing the same logical payload always
// produces the same bytes to sign/verify).
function canonicalize(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((k) => `${JSON.stringify(k)}:${canonicalize(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export class SignatureService {
  constructor(signingKey) {
    if (!signingKey) {
      throw new Error("SignatureService requires a signing key");
    }
    this.key = signingKey;
  }

  /**
   * Sign a payload (any JSON-serializable object) with HMAC-SHA256.
   * Returns a hex digest string (full 64 hex chars of SHA-256).
   */
  sign(payload) {
    const message = canonicalize(payload);
    return CryptoJS.HmacSHA256(message, this.key).toString(CryptoJS.enc.Hex);
  }

  /**
   * Verify that `signature` is the correct HMAC-SHA256 of `payload` under
   * this service's key. Recomputes independently — never trusts the caller.
   */
  verify(payload, signature) {
    const expected = this.sign(payload);
    return expected === signature;
  }
}
