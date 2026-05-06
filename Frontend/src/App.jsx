import { useState, useEffect } from "react";
import "./App.css";

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY LAYER (Hybrid Encryption)
// ══════════════════════════════════════════════════════════════════════════════

const PUBLIC_KEY_URL = "https://localhost:5000/api/publickey";

const toB64 = (buf) => {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

let _serverPublicKey = null;

async function getServerPublicKey() {
  if (_serverPublicKey) return _serverPublicKey;

  const res = await fetch(PUBLIC_KEY_URL);
  if (!res.ok)
    throw new Error(`Could not fetch public key (HTTP ${res.status})`);

  const json = await res.json();
  const pem = json.publicKey;

  if (typeof pem !== "string" || !pem.includes("PUBLIC KEY"))
    throw new Error("Server returned an unrecognisable public key format.");

  const b64 = pem
    .replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");

  const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

  _serverPublicKey = await crypto.subtle.importKey(
    "spki",
    der.buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["wrapKey"],
  );
  return _serverPublicKey;
}

async function encryptPayload(obj) {
  const serverPubKey = await getServerPublicKey();

  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(JSON.stringify(obj)),
  );

  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, serverPubKey, {
    name: "RSA-OAEP",
  });

  return {
    wrappedKey: toB64(wrappedKey),
    iv: toB64(iv),
    data: toB64(cipher),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  VALIDATION & CONFIG
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

const strengthScore = (pw) => PASS_RULES.filter((r) => r.re.test(pw)).length;

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

const SIGNUP_FIELDS = [
  { id: "username", label: "Username", type: "text", placeholder: "john_doe", required: true, half: true },
  { id: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true, half: true },
  { id: "email", label: "Email", type: "email", placeholder: "john@example.com", required: true, half: false },
  { id: "phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000", required: false, half: true },
  { id: "dob", label: "Date of Birth", type: "date", placeholder: "", required: false, half: true, hint: "Optional" },
  { id: "password", label: "Password", type: "password", placeholder: "••••••••", required: true, half: false },
  { id: "confirm", label: "Confirm Password", type: "password", placeholder: "••••••••", required: true, half: false },
];

const SIGNIN_FIELDS = [
  { id: "email", label: "Email", type: "email", placeholder: "john@example.com", required: true, half: false },
  { id: "password", label: "Password", type: "password", placeholder: "••••••••", required: true, half: false },
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
          <span key={i} className="strength-bar" style={{ background: i <= score ? colors[score] : "var(--border)" }} />
        ))}
      </div>
      <span className="strength-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast toast--${type}`} role="alert">{type === "success" ? "✅" : "⚠️"} {msg}</div>;
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState(DEMO_SIGNIN);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [showPass, setShowPass] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Correctly defining fields inside the component scope
  const fields = mode === "signup" ? SIGNUP_FIELDS : SIGNIN_FIELDS;

  // Session Check Effect
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("https://localhost:5000/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session restoration failed:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    checkSession();
  }, []);

  const flash = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type }), 5000);
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setForm(m === "signup" ? DEMO_SIGNUP : DEMO_SIGNIN);
    setToast({ msg: "", type: "success" });
    setShowPass(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("https://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const plain = mode === "signup" 
        ? { ...form, email: form.email.toLowerCase(), createdAt: new Date().toISOString() }
        : { email: form.email.toLowerCase(), password: form.password };

      const encrypted = await encryptPayload(plain);
      const url = `https://localhost:5000/api/auth/sing${mode === "signup" ? "up" : "in"}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(encrypted),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Auth failed");

      setUser(body.user);
      flash(mode === "signup" ? "Account created!" : "Signed in!", "success");
    } catch (err) {
      flash(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isInitializing) {
    return <div className="auth-root"><div className="auth-card"><h2>Loading Session...</h2></div></div>;
  }

  if (user) {
    return (
      <div className="auth-root">
        <div className="blob blob-a" />
        <div className="auth-card" style={{ maxWidth: "600px" }}>
          <h1 className="auth-title">Welcome back!</h1>
          <div style={{ textAlign: "left", marginTop: "1rem" }}>
             <label className="field-label">Your Session Data:</label>
             <pre style={{ background: "#111", padding: "1rem", borderRadius: "8px", color: "#0f0", overflow: "auto" }}>
               {JSON.stringify(user, null, 2)}
             </pre>
          </div>
          <button className="submit-btn" style={{ marginTop: "2rem" }} onClick={handleLogout}>Log Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-root">
      <div className="blob blob-a" /><div className="blob blob-b" /><div className="blob blob-c" />
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><span className="logo-icon">⬡</span></div>
          <h1 className="auth-title">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
        </div>

        <div className="auth-tabs">
          {["signin", "signup"].map((m) => (
            <button key={m} className={`tab-btn ${mode === m ? "tab-btn--active" : ""}`} onClick={() => switchMode(m)}>
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="fields-grid">
            {fields.map((f) => (
              <div key={f.id} className={`field-group ${f.half ? "" : "field-group--full"}`}>
                <label className="field-label">{f.label} {f.required && "*"}</label>
                <div className="field-wrap">
                  <input
                    id={f.id}
                    className="field-input"
                    type={(f.id === "password" || f.id === "confirm") && showPass ? "text" : f.type}
                    value={form[f.id] ?? ""}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                  />
                  {f.id === "password" && (
                    <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                      {showPass ? "🙈" : "👁"}
                    </button>
                  )}
                </div>
                {f.id === "password" && mode === "signup" && <StrengthMeter password={form.password} />}
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading} className={`submit-btn ${loading ? "submit-btn--loading" : ""}`}>
            {loading ? "Processing..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
        <Toast msg={toast.msg} type={toast.type} />
        <p className="auth-footer">
          {mode === "signup" ? "Already have an account? " : "New here? "}
          <button className="link-btn" onClick={() => switchMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}