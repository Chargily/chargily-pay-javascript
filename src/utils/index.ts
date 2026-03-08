import crypto from 'crypto';

/**
 * Verifies the signature of the incoming webhook request.
 * @param {Buffer} payload - The raw body buffer of the request.
 * @param {string} signature - The signature header from the webhook request.
 * @param {string} secretKey - Your Chargily API secret key.
 * @returns {boolean} - Returns true if the signature is valid, false otherwise.
 */
export function verifySignature(
  payload: Buffer,
  signature: string,
  secretKey: string
): boolean {
  if (!signature) {
    return false;
  }

  // AUDIT [HIGH-1]: sigPrefix is an empty placeholder. If Chargily's API
  // uses a prefix (e.g. 'sha256=' like GitHub), all verifications will
  // silently fail. Needs verification against actual API spec.
  const sigPrefix = ''; // Define if there's a specific prefix used
  const sigHashAlg = 'sha256'; // Define the hashing algorithm
  const computedSignature = crypto
    .createHmac(sigHashAlg, secretKey)
    .update(payload)
    .digest('hex');

  const digest = Buffer.from(sigPrefix + computedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  // AUDIT [CRITICAL-2]: Throws instead of returning false. This contradicts
  // the return type 'boolean' and the early guard above (line 16) which
  // correctly returns false. Fix: Replace throw with 'return false'.
  if (
    signatureBuffer.length !== digest.length ||
    !crypto.timingSafeEqual(digest, signatureBuffer)
  ) {
    throw new Error('The signature is invalid.');
  }

  // AUDIT [CRITICAL-3]: Library code must never log to the console.
  // This pollutes stdout of every app using this SDK in production.
  // Fix: Remove this line entirely.
  console.log('The signature is valid');
  return true;
}
