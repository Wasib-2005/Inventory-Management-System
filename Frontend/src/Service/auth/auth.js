import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_HEADER;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Fetches the server's RSA public key (PEM) and imports it as a CryptoKey.
 * Result is cached so we only hit the network once per session.
 */
let _cachedPublicKey = null;

const getPublicKey = async () => {
  if (_cachedPublicKey) return _cachedPublicKey;

  const { data } = await axios.get(`${BASE}/api/publickey`);
  // Expect: { publicKey: "-----BEGIN PUBLIC KEY-----\n..." }
  const pem = data.publicKey;

  const binaryDer = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );

  _cachedPublicKey = await crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false, // not extractable
    ["wrapKey"],
  );

  return _cachedPublicKey;
};

/**
 * Converts an ArrayBuffer to a Base64 string.
 */
const toBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

/**
 * Hybrid-encrypts `payload` for the backend.
 * Mirrors the backend's hybridDecryption expectations exactly.
 *
 * Returns { wrappedKey, iv, data } — all Base64 strings.
 */
const hybridEncrypt = async (payload) => {
  const rsaPublicKey = await getPublicKey();

  // 1 — Generate a fresh one-time AES-256-GCM key
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // must be extractable to wrap it
    ["encrypt"],
  );

  // 2 — Random 12-byte IV (matches backend IV_BYTES = 12)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3 — AES-GCM encrypt the payload
  //     WebCrypto appends the 16-byte auth tag at the END of the ciphertext,
  //     which is exactly what the backend's hybridDecryption expects.
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    encoded,
  );

  // 4 — RSA-OAEP wrap the one-time AES key
  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, rsaPublicKey, {
    name: "RSA-OAEP",
  });

  return {
    wrappedKey: toBase64(wrappedKey),
    iv: toBase64(iv),
    data: toBase64(encryptedData), // ciphertext + auth tag
  };
};

// ── Auth API calls ─────────────────────────────────────────────────────────────

export const signInFunc = async (userData) => {
  const envelope = await hybridEncrypt(userData);

  const { data } = await axios.post(`${BASE}/api/auth/singin`, envelope, {
    withCredentials: true, // lets the browser store HttpOnly auth cookies
  });

  return data;
};

export const signUpFunc = async (userData) => {
  const envelope = await hybridEncrypt(userData);

  const { data } = await axios.post(`${BASE}/api/auth/singup`, envelope, {
    withCredentials: true,
  });

  return data;
};

export const refresh_auth = async () => {
  const { data } = await axios.post(
    `${BASE}/api/auth/refresh`,
    {}, // empty body — token comes from the cookie
    { withCredentials: true }, // browser attaches the HttpOnly refresh_token cookie
  );
  return data; // { accessToken, user, ... } — whatever sendResponse returns
};
