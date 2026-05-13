import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_API_HEADER;

// ── Helpers ────────────────────────────────────────────────────────────────────

let _cachedPublicKey = null;

const getPublicKey = async () => {
  if (_cachedPublicKey) return _cachedPublicKey;

  const { data } = await axios.get(`${BASE}/api/publickey`);
  const pem = data.publicKey;

  const binaryDer = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")),
    (c) => c.charCodeAt(0),
  );

  _cachedPublicKey = await crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["wrapKey"],
  );

  return _cachedPublicKey;
};

const toBase64 = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

export const hybridEncrypt = async (payload) => {
  const rsaPublicKey = await getPublicKey();

  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(payload)),
  );

  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, rsaPublicKey, {
    name: "RSA-OAEP",
  });

  return {
    wrappedKey: toBase64(wrappedKey),
    iv: toBase64(iv),
    data: toBase64(encryptedData),
  };
};

// ── Auth API calls ─────────────────────────────────────────────────────────────

export const signInFunc = async (userData) => {
  const { data } = await axios.post(
    `${BASE}/api/auth/singin`,
    await hybridEncrypt(userData),
    { withCredentials: true },
  );
  return data;
};

export const signUpFunc = async (userData) => {
  const { data } = await axios.post(
    `${BASE}/api/auth/singup`,
    await hybridEncrypt(userData),
    { withCredentials: true },
  );
  return data;
};

export const refresh_auth = async () => {
  const { data } = await axios.post(
    `${BASE}/api/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return data;
};