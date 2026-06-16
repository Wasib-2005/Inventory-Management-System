import jwt from "jsonwebtoken";
import crypto from "crypto";
import ms from "ms"; // Parses strings like "7d" or "15m" into milliseconds
import RefreshToken from "../models/refreshToken.model.js";

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// ── Read from .env with fallback defaults ─────────────────────────────────────
const ACCESS_TTL     = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL    = process.env.JWT_REFRESH_TTL || "7d";

// Automatically convert the strings to millisecond numbers
const ACCESS_TTL_MS  = ms(ACCESS_TTL);
const REFRESH_TTL_MS = ms(REFRESH_TTL);

// ── Token generation ──────────────────────────────────────────────────────────

export const generateAccessToken = (userId) =>
  jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });

export const generateRefreshToken = (userId, family) =>
  jwt.sign({ sub: userId, fam: family }, REFRESH_SECRET, { expiresIn: REFRESH_TTL });

// SHA-256 hash of the raw JWT string — what we store in MongoDB
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ── Persist a new refresh token (one per family) ──────────────────────────────

export const saveRefreshToken = async (userId, rawToken, family) => {
  // 1. Remove any old token for this specific family (if rotating)
  await RefreshToken.deleteOne({ user: userId, family });

  // 2. Enforce a maximum session limit (e.g., 5 devices)
  const MAX_SESSIONS = 5;
  const activeSessions = await RefreshToken.find({ user: userId }).sort({ createdAt: 1 });

  // If the user has 5 or more sessions, delete the oldest ones until they are under the limit
  if (activeSessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = activeSessions.slice(0, activeSessions.length - MAX_SESSIONS + 1);
    const sessionIdsToDelete = sessionsToDelete.map(session => session._id);
    
    await RefreshToken.deleteMany({ _id: { $in: sessionIdsToDelete } });
  }

  // 3. Create the new token (Uses dynamic REFRESH_TTL_MS)
  await RefreshToken.create({
    user:      userId,
    tokenHash: hashToken(rawToken),
    family,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
};

// ── Verify + rotate refresh token ─────────────────────────────────────────────

export const rotateRefreshToken = async (rawToken) => {
  // 1. Verify JWT signature + expiry
  const payload = jwt.verify(rawToken, REFRESH_SECRET); // throws if invalid

  // 2. Look up the hashed token in DB
  const stored = await RefreshToken.findOne({
    user:      payload.sub,
    family:    payload.fam,
    tokenHash: hashToken(rawToken),
  });

  if (!stored) {
    // Token not in DB — possible reuse after rotation → nuke the whole family
    await RefreshToken.deleteMany({ user: payload.sub, family: payload.fam });
    throw new Error("Refresh token reuse detected");
  }

  // 3. Delete old token and issue a fresh one (rotation)
  await stored.deleteOne();

  const newRaw   = generateRefreshToken(payload.sub, payload.fam);
  await saveRefreshToken(payload.sub, newRaw, payload.fam);

  return { userId: payload.sub, newRefreshToken: newRaw };
};

// ── Verify access token (used by middleware) ───────────────────────────────────

export const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET); // throws on failure

// ── Cookie helpers ─────────────────────────────────────────────────────────────

const IS_PROD = process.env.NODE_ENV === "production";

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "strict",
    maxAge:   ACCESS_TTL_MS,            // Dynamic: uses parsed access token TTL
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: "strict",
    maxAge:   REFRESH_TTL_MS,           // Dynamic: uses parsed refresh token TTL
    path:     "/api/auth",              // only sent to auth routes
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth" });
};