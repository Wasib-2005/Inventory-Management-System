import jwt from "jsonwebtoken";
import crypto from "crypto";
import ms from "ms";
import RefreshToken from "../models/refreshToken.model.js";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";

const ACCESS_TTL_MS = ms(ACCESS_TTL);
const REFRESH_TTL_MS = ms(REFRESH_TTL);

export const generateAccessToken = (userId) =>
  jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: ACCESS_TTL });

export const generateRefreshToken = (userId, family) =>
  jwt.sign({ sub: userId, fam: family }, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const saveRefreshToken = async (userId, rawToken, family) => {
  await RefreshToken.deleteOne({ user: userId, family });

  const MAX_SESSIONS = 5;
  const activeSessions = await RefreshToken.find({ user: userId }).sort({
    createdAt: 1,
  });

  if (activeSessions.length >= MAX_SESSIONS) {
    const sessionsToDelete = activeSessions.slice(
      0,
      activeSessions.length - MAX_SESSIONS + 1,
    );
    const sessionIdsToDelete = sessionsToDelete.map((session) => session._id);

    await RefreshToken.deleteMany({ _id: { $in: sessionIdsToDelete } });
  }

  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(rawToken),
    family,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
};

export const rotateRefreshToken = async (rawToken) => {
  const payload = jwt.verify(rawToken, REFRESH_SECRET);

  const stored = await RefreshToken.findOne({
    user: payload.sub,
    family: payload.fam,
    tokenHash: hashToken(rawToken),
  });

  if (!stored) {
    await RefreshToken.deleteMany({ user: payload.sub, family: payload.fam });
    throw new Error("Refresh token reuse detected");
  }

  await stored.deleteOne();

  const newRaw = generateRefreshToken(payload.sub, payload.fam);
  await saveRefreshToken(payload.sub, newRaw, payload.fam);

  return { userId: payload.sub, newRefreshToken: newRaw };
};

export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);


const IS_PROD = process.env.NODE_ENV === "production";

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
  });
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: REFRESH_TTL_MS,
    path: "/api/auth", 
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token", { path: "/api/auth" });
};
