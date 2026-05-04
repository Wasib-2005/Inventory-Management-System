import { useState } from "react";
import "./App.css";

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY LAYER
//
//  Key exchange  : RSA-OAEP 2048-bit  (server public key from /api/publickey)
//  Payload       : AES-GCM 256-bit, random IV, ephemeral key
//
//  Flow:
//    1. Fetch server RSA public key once (cached in module scope)
//    2. Generate ephemeral AES-GCM key
//    3. Encrypt payload  →  AES-GCM ciphertext
//    4. Wrap AES key     →  RSA-OAEP with server public key
//    5. Send { wrappedKey, iv, data } to server
//       Server: unwraps AES key with private key → decrypts payload
// ══════════════════════════════════════════════════════════════════════════════

const PUBLIC_KEY_URL = "https://localhost:5000/api/publickey";

// ── helpers ──────────────────────────────────────────────────────────────────
// Loop instead of spread — avoids call-stack overflow on large buffers
// (e.g. the 256-byte RSA-wrapped AES key)
const toB64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

// ── server public key (lazy, cached) ─────────────────────────────────────────
let _serverPublicKey = null; // CryptoKey cached after first fetch

async function getServerPublicKey() {
  if (_serverPublicKey) return _serverPublicKey;

  const res = await fetch(PUBLIC_KEY_URL);
  if (!res.ok)
    throw new Error(`Could not fetch public key (HTTP ${res.status})`);

  // Server returns { success: true, publicKey: "-----BEGIN PUBLIC KEY-----\n..." }
  const json = await res.json();
  const pem = json.publicKey;

  if (typeof pem !== "string" || !pem.includes("PUBLIC KEY"))
    throw new Error("Server returned an unrecognisable public key format.");

  // Strip PEM headers + all whitespace (\n etc.) → clean base64 → DER bytes
  const b64 = pem
    .replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");

  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  _serverPublicKey = await crypto.subtle.importKey(
    "spki",
    der.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["wrapKey"], // only need to wrap, never export
  );
  return _serverPublicKey;
}

// Password hashing (PBKDF2 / bcrypt) is done entirely on the server.
// The raw password is only ever visible inside the AES-GCM ciphertext,
// which is itself wrapped by RSA-OAEP — never exposed in transit.

// ── Hybrid encryption ─────────────────────────────────────────────────────────
// Returns { wrappedKey, iv, data } — all Base64 strings
async function encryptPayload(obj) {
  const serverPubKey = await getServerPublicKey();

  // 1. Ephemeral AES-GCM key
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  // 2. Encrypt payload
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(obj)),
  );

  // 3. Wrap (RSA-OAEP encrypt) the AES key with the server's public key
  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, serverPubKey, {
    name: "RSA-OAEP",
  });

  return {
    wrappedKey: toB64(wrappedKey), // RSA-OAEP encrypted AES key
    iv: toB64(iv), // AES-GCM nonce
    data: toB64(cipher), // AES-GCM ciphertext
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  VALIDATION
// ══════════════════════════════════════════════════════════════════════════════
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s\-().]{7,20}$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

const PASS_RULES = [
  { re: /.{8,}/, label: "8+ chars" },
  { re: /[A-Z]/, label: "uppercase" },
  { re: /[0-9]/, label: "number" },
  { re: /[^A-Za-z0-9]/, label: "symbol" },
];

function strengthScore(pw) {
  return PASS_RULES.filter((r) => r.re.test(pw)).length;
}

function validateSignup(f) {
  if (!USERNAME_RE.test(f.username || ""))
    return "Username must be 3–20 chars (letters, numbers, _).";
  if (!f.name?.trim()) return "Full name is required.";
  if (!EMAIL_RE.test(f.email || "")) return "Enter a valid email address.";
  if (f.phone && !PHONE_RE.test(f.phone))
    return "Phone number format looks invalid.";
  const score = strengthScore(f.password || "");
  if (score < 3)
    return `Password too weak — needs: ${PASS_RULES.filter(
      (r) => !r.re.test(f.password || ""),
    )
      .map((r) => r.label)
      .join(", ")}.`;
  if (f.password !== f.confirm) return "Passwords do not match.";
  return null;
}

function validateSignin(f) {
  if (!EMAIL_RE.test(f.email || "")) return "Enter a valid email address.";
  if (!f.password) return "Password is required.";
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
//  PRE-FILLED DEMO DATA
// ══════════════════════════════════════════════════════════════════════════════
const DEMO_SIGNUP = {
  username: "john_doe",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 555 000 0000",
  dob: "",
  password: "ASD123$#$%a",
  confirm: "ASD123$#$%a",
};
const DEMO_SIGNIN = {
  email: "john@example.com",
  password: "ASD123$#$%a",
};

// ══════════════════════════════════════════════════════════════════════════════
//  FIELD CONFIG
// ══════════════════════════════════════════════════════════════════════════════
const SIGNUP_FIELDS = [
  {
    id: "username",
    label: "Username",
    type: "text",
    placeholder: "john_doe",
    required: true,
    half: true,
  },
  {
    id: "name",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    required: true,
    half: true,
  },
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    required: true,
    half: false,
  },
  {
    id: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+1 555 000 0000",
    required: false,
    half: true,
  },
  {
    id: "dob",
    label: "Date of Birth",
    type: "date",
    placeholder: "",
    required: false,
    half: true,
    hint: "Leave blank if you prefer not to share.",
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    required: true,
    half: false,
  },
  {
    id: "confirm",
    label: "Confirm Password",
    type: "password",
    placeholder: "••••••••",
    required: true,
    half: false,
  },
];

const SIGNIN_FIELDS = [
  {
    id: "email",
    label: "Email",
    type: "email",
    placeholder: "john@example.com",
    required: true,
    half: false,
  },
  {
    id: "password",
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    required: true,
    half: false,
  },
];

// ══════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════
function StrengthMeter({ password }) {
  if (!password) return null;
  const score = strengthScore(password);
  const colors = ["", "#f87171", "#fb923c", "#facc15", "#34d399"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="strength-wrap">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="strength-bar"
            style={{ background: i <= score ? colors[score] : "var(--border)" }}
          />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[score] }}>
        {labels[score]}
      </span>
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast toast--${type}`} role="alert">
      {type === "success" ? "✅" : "⚠️"} {msg}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState(DEMO_SIGNIN);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [showPass, setShowPass] = useState(false);

  const fields = mode === "signup" ? SIGNUP_FIELDS : SIGNIN_FIELDS;

  const flash = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type }), 5000);
  };

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setForm(m === "signup" ? DEMO_SIGNUP : DEMO_SIGNIN);
    setToast({ msg: "", type: "success" });
    setShowPass(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = mode === "signup" ? validateSignup(form) : validateSignin(form);
    if (err) {
      flash(err);
      return;
    }

    setLoading(true);
    try {
      // Build plain payload — password sent raw inside the encrypted envelope.
      // The server handles all hashing (PBKDF2 / bcrypt).
      const plain =
        mode === "signup"
          ? {
              username: form.username.trim(),
              name: form.name.trim(),
              email: form.email.trim().toLowerCase(),
              phone: form.phone?.trim() || null,
              dob: form.dob || null,
              password: form.password,
              createdAt: new Date().toISOString(),
            }
          : {
              email: form.email.trim().toLowerCase(),
              password: form.password,
            };

      // 2. Hybrid-encrypt: RSA-OAEP wraps ephemeral AES-GCM key
      //    encryptPayload fetches /api/publickey on first call (cached after)
      const encrypted = await encryptPayload(plain);
      // encrypted = { wrappedKey, iv, data }  — all Base64

      // 3. Send to server
      const url =
        mode === "signup"
          ? "https://localhost:5000/api/auth/singup"
          : "https://localhost:5000/api/auth/singin";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(encrypted),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }

      flash(
        mode === "signup" ? "Account created successfully!" : "Signed in!",
        "success",
      );
      setForm((f) => ({ ...f, password: "", confirm: "" }));
    } catch (err) {
      flash(err.message || "Request failed — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="blob blob-a" />
      <div className="blob blob-b" />
      <div className="blob blob-c" />

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-icon">⬡</span>
          </div>
          <h1 className="auth-title">
            {mode === "signup" ? "Create account" : "Welcome back"}
          </h1>
          <p className="auth-sub">
            {mode === "signup"
              ? "Fill in your details — starred fields are required."
              : "Sign in to continue where you left off."}
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          {["signin", "signup"].map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              className={`tab-btn ${mode === m ? "tab-btn--active" : ""}`}
              onClick={() => switchMode(m)}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
          <span
            className="tab-indicator"
            style={{
              transform:
                mode === "signup" ? "translateX(100%)" : "translateX(0)",
            }}
          />
        </div>

        {/* Fields */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="fields-grid">
            {fields.map((f) => (
              <div
                key={f.id}
                className={["field-group", !f.half && "field-group--full"]
                  .filter(Boolean)
                  .join(" ")}
              >
                <label htmlFor={f.id} className="field-label">
                  {f.label}
                  {f.required ? (
                    <span className="req" title="Required">
                      {" "}
                      *
                    </span>
                  ) : (
                    <span className="opt"> optional</span>
                  )}
                </label>

                <div className="field-wrap">
                  <input
                    id={f.id}
                    className="field-input"
                    type={
                      (f.id === "password" || f.id === "confirm") && showPass
                        ? "text"
                        : f.type
                    }
                    placeholder={f.placeholder}
                    value={form[f.id] ?? ""}
                    onChange={handleChange}
                    required={f.required}
                    autoComplete={
                      f.id === "password" || f.id === "confirm"
                        ? "new-password"
                        : f.id === "email"
                          ? "email"
                          : "off"
                    }
                  />
                  {f.id === "password" && (
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Hide password" : "Show password"}
                    >
                      {showPass ? "🙈" : "👁"}
                    </button>
                  )}
                </div>

                {f.hint && <span className="field-hint">{f.hint}</span>}

                {f.id === "password" && mode === "signup" && (
                  <StrengthMeter password={form.password} />
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? "submit-btn--loading" : ""}`}
          >
            {loading ? (
              <span className="spinner" />
            ) : mode === "signup" ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <Toast msg={toast.msg} type={toast.type} />

        <p className="auth-footer">
          {mode === "signup"
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
        <button
          onClick={() => {
            fetch("https://localhost:5000/api/auth/refresh_auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
          }}
        >
          refresh auth
        </button>
        <div className="security-badges">
          <span title="AES key wrapped with server RSA-OAEP 2048-bit public key">
            🔐 RSA-OAEP 2048
          </span>
          <span title="Payload encrypted with AES-GCM 256-bit">
            🔒 AES-GCM 256
          </span>
        </div>
      </div>
    </div>
  );
}
