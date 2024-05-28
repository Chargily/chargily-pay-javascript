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

  const sigPrefix = ''; // Define if there's a specific prefix used
  const sigHashAlg = 'sha256'; // Define the hashing algorithm
  const computedSignature = crypto
    .createHmac(sigHashAlg, secretKey)
    .update(payload)
    .digest('hex');

  const digest = Buffer.from(sigPrefix + computedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (
    signatureBuffer.length !== digest.length ||
    !crypto.timingSafeEqual(digest, signatureBuffer)
  ) {
    throw new Error('The signature is invalid.');
  }

  console.log('The signature is valid');
  return true;
}
