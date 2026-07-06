import crypto from "crypto";
import {
  serverPublicKey,
  serverPrivateKey,
  serverSeasonKey,
} from "../config/keyManager.js";
import logger from "../config/logger.js";

const AES_ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const TAG_BYTES = 16;

export const asymmetricEncryption = (plaintext) => {
  const buffer = Buffer.isBuffer(plaintext)
    ? plaintext
    : Buffer.from(plaintext, "utf8");

  return crypto
    .publicEncrypt(
      {
        key: serverPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      buffer,
    )
    .toString("base64");
};

export const asymmetricDecryption = (ciphertextBase64) => {
  return crypto
    .privateDecrypt(
      {
        key: serverPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(ciphertextBase64, "base64"),
    )
    .toString("utf8");
};

export const symmetricEncryption = (data) => {
  const plaintext = typeof data === "string" ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, serverSeasonKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
};

export const symmetricDecryption = (payloadBase64) => {
  const payload = Buffer.from(payloadBase64, "base64");
  const iv = payload.subarray(0, IV_BYTES);
  const authTag = payload.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = payload.subarray(IV_BYTES + TAG_BYTES);

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, serverSeasonKey, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");

  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};

/**
 * Decrypts a hybrid payload FROM the frontend.
 * Frontend encrypts with: RSA public key (wraps AES key) + AES-GCM (encrypts data)
 *
 * @param {{ wrappedKey: string, iv: string, data: string }} envelope
 * wrappedKey — RSA-OAEP encrypted AES key           (Base64)
 * iv         — random nonce used during AES encrypt  (Base64)
 * data       — AES-GCM ciphertext + auth tag         (Base64)
 */
export const hybridDecryption = ({ wrappedKey, iv, data }) => {
  const aesKey = crypto.privateDecrypt(
    {
      key: serverPrivateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(wrappedKey, "base64"),
  );

  const cipherBuf = Buffer.from(data, "base64");
  const authTag = cipherBuf.subarray(cipherBuf.length - TAG_BYTES);
  const ciphertext = cipherBuf.subarray(0, cipherBuf.length - TAG_BYTES);

  const decipher = crypto.createDecipheriv(
    AES_ALGORITHM,
    aesKey,
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8"));
};

/**
 * Encrypts a payload TO the frontend using the same hybrid envelope.
 * Frontend decrypts with: RSA private key (unwraps AES key) + AES-GCM (decrypts data)
 *
 * @returns {{ wrappedKey: string, iv: string, data: string }}
 */
export const hybridEncryption = (payload) => {
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(IV_BYTES);

  const cipher = crypto.createCipheriv(AES_ALGORITHM, aesKey, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  const data = Buffer.concat([encrypted, cipher.getAuthTag()]);

  const wrappedKey = crypto.publicEncrypt(
    {
      key: serverPublicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aesKey,
  );

  return {
    wrappedKey: wrappedKey.toString("base64"),
    iv: iv.toString("base64"),
    data: data.toString("base64"),
  };
};
