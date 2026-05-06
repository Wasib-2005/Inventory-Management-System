import crypto from "crypto";
import User from "../../models/user.model.js";
import RefreshToken from "../../models/refreshToken.model.js";
import logger from "../../config/logger.js";
import {
  hashPass,
  compHashPass,
} from "../../utility/hash_utility/passHashManager.js";
import { hybridDecryption } from "../../utility/ecryptionDecryption.js";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  verifyAccessToken,
  setAuthCookies,
  clearAuthCookies,
} from "../../utility/tokenService.js";

// ── Shared: strip sensitive fields and send clean user object ─────────────────
const sendResponse = (res, statusCode, accessToken, refreshToken, user) => {
  setAuthCookies(res, accessToken, refreshToken);

  const { password, _id, __v, loginAttempts, lockUntil, ...cleanedUser } =
    user.toObject();

  return res.status(statusCode).json({ user: cleanedUser });
};

// ── SIGN UP ───────────────────────────────────────────────────────────────────
export const signUpLogic = async (req, res) => {
  try {
    const plain = hybridDecryption(req.body);
    const { email, password } = plain;

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "An account already exists" });
    }

    const hashedPassword = await hashPass(password);
    const newUser = await User.create({ ...plain, password: hashedPassword });

    // Issue tokens
    const family = crypto.randomUUID(); // one family per session
    const accessToken = generateAccessToken(newUser._id.toString());
    const refreshToken = generateRefreshToken(newUser._id.toString(), family);
    await saveRefreshToken(newUser._id.toString(), refreshToken, family);

    logger.info(`User created: ${newUser.email}`);
    return sendResponse(res, 201, accessToken, refreshToken, newUser);
  } catch (err) {
    logger.error("Signup Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── SIGN IN ───────────────────────────────────────────────────────────────────
export const signInLogic = async (req, res) => {
  try {
    const plain = hybridDecryption(req.body);

    const { email, password } = plain;

    const user = await User.findOne({ email });

    // Unknown email — don't hint which field was wrong
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Account locked?
    if (user.isLocked) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({
        message: `Account locked. Try again in ${remaining} minute(s).`,
      });
    }

    console.log("afdsg iojsdfghfdihertyoijh ryt", password, user.password);
    
    const passwordOk = await compHashPass(password, user.password);

    if (!passwordOk) {
      await user.incLoginAttempts();
      const attemptsLeft = Math.max(0, 5 - (user.loginAttempts + 1));
      return res.status(401).json({
        message:
          attemptsLeft > 0
            ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining.`
            : "Account locked for 5 minutes due to too many failed attempts.",
      });
    }

    // Success — reset counter and issue fresh tokens
    await user.resetLoginAttempts();

    const family = crypto.randomUUID();
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString(), family);
    await saveRefreshToken(user._id.toString(), refreshToken, family);

    logger.info(`User signed in: ${user.email}`);
    return sendResponse(res, 200, accessToken, refreshToken, user);
  } catch (err) {
    logger.error("SignIn Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── REFRESH ───────────────────────────────────────────────────────────────────
export const refreshAuth = async (req, res) => {
  try {
    const rawRefresh = req.cookies?.refresh_token;
    if (!rawRefresh) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const { userId, newRefreshToken } = await rotateRefreshToken(rawRefresh);

    const user = await User.findById(userId);
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(userId);

    logger.debug(`Session refreshed: ${user.email}`);
    return sendResponse(res, 200, newAccessToken, newRefreshToken, user);
  } catch (err) {
    logger.error("Refresh Error:", err.message);
    clearAuthCookies(res); // force re-login on any rotation failure
    return res.status(401).json({ message: "Session expired" });
  }
};

// ── LOGOUT ────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    const rawRefresh = req.cookies?.refresh_token;

    if (rawRefresh) {
      // Best-effort: delete this specific token family from DB
      // rotateRefreshToken would verify first, but on logout we just nuke it
      const crypto = await import("crypto");
      const hash = crypto.createHash("sha256").update(rawRefresh).digest("hex");
      await RefreshToken.deleteOne({ tokenHash: hash });
    }

    clearAuthCookies(res);
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    logger.error("Logout Error:", err);
    clearAuthCookies(res); // still clear cookies even if DB op failed
    return res.status(200).json({ message: "Logged out" });
  }
};
