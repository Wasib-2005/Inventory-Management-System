import crypto from 'crypto'
import { serverPrivateKey } from '../config/keyManager.js'

/**
 * Decrypts a hybrid-encrypted payload from the frontend.
 *
 * Envelope:
 *   wrappedKey  — RSA-OAEP 2048 encrypted AES-256 key  (Base64)
 *   iv          — AES-GCM 96-bit nonce                  (Base64)
 *   data        — AES-GCM 256-bit ciphertext + auth tag (Base64)
 */
const decryptPayload = async ({ wrappedKey, iv, data }) => {
  // ── 1. RSA-OAEP: unwrap the ephemeral AES key ──────────────────────────────
  const aesKeyBuf = crypto.privateDecrypt(
    {
      key:     serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(wrappedKey, 'base64')
  )
  // aesKeyBuf is now the raw 32-byte AES-256 key

  // ── 2. AES-GCM: split ciphertext and auth tag ───────────────────────────────
  // WebCrypto appends the 16-byte GCM auth tag at the END of the ciphertext
  const cipherBuf  = Buffer.from(data, 'base64')
  const authTag    = cipherBuf.subarray(cipherBuf.length - 16)   // last 16 bytes
  const ciphertext = cipherBuf.subarray(0, cipherBuf.length - 16) // everything before

  // ── 3. AES-GCM: decrypt ─────────────────────────────────────────────────────
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    aesKeyBuf,
    Buffer.from(iv, 'base64')
  )
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),           // throws if auth tag is wrong (tampered data)
  ])

  return JSON.parse(decrypted.toString('utf8'))
}

export default decryptPayload