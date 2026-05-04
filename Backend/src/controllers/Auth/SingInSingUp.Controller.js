import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import logger from "../../config/logger.js";
import { getToken } from "../../utility/getToken.js";
import {
  compHashPass,
  hashPass,
} from "../../utility/hash_utility/passHashManager.js";
import {
  hybridDecryption,
  symmetricDecryption,
  symmetricEncryption,
} from "../../utility/ecryptionDecryption.js";

/**
 * ── SHARED: CLEAN & SEND RESPONSE ────────────────────────────────────────────
 * Returns RAW data (not encrypted).
 * Skips only 'password', '_id', and '__v'. All other fields are sent.
 */
const sendResponse = (res, statusCode, token, user) => {
  // 1. Set the secure cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 86400000, // 24 hours
  });

  // 2. Convert Mongoose Document to plain Object and strip sensitive fields
  const userObj = user.toObject();
  const { password, _id, __v, ...cleanedUser } = userObj;

  // 3. Return raw JSON (not encrypted)
  return res.status(statusCode).json({
    user: cleanedUser,
  });
};

// ── SIGN UP ───────────────────────────────────────────────────────────────────

export const signUpLogic = async (req, res) => {
  try {
    const plain = hybridDecryption(req.body);
    const { email, password, username, phone } = plain;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account already exists" });
    }

    const hashedPassword = await hashPass(password);
    
    // Create user with all provided fields
    const newUser = await User.create({ 
      ...plain, 
      password: hashedPassword 
    });

    const encryptedData = symmetricEncryption(JSON.stringify({ email: newUser.email }));
    const token = getToken(encryptedData, "1d");

    logger.info(`User created: ${newUser.email}`);
    return sendResponse(res, 201, token, newUser);
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
    
    if (!user || !(await compHashPass(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const encryptedData = symmetricEncryption(JSON.stringify({ email: user.email }));
    const token = getToken(encryptedData, "1d");

    logger.info(`User signed in: ${user.email}`);
    return sendResponse(res, 200, token, user);
  } catch (err) {
    logger.error("SignIn Error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ── REFRESH AUTH ──────────────────────────────────────────────────────────────

export const refreshAuth = async (req, res) => {
  try {
    const token = req.cookies?.auth_token;
    if (!token) return res.status(401).json({ message: "No session" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const encryptedString = decoded.data || (typeof decoded === 'string' ? decoded : null);
    
    const decryptedPayload = symmetricDecryption(encryptedString); 
    const data = typeof decryptedPayload === 'string' ? JSON.parse(decryptedPayload) : decryptedPayload;

    // Fetch user and populate role if needed
    const user = await User.findOne({ email: data.email });

    if (!user) {
      res.clearCookie("auth_token");
      return res.status(401).json({ message: "User not found" });
    }

    const newEncryptedData = symmetricEncryption(JSON.stringify({ email: user.email }));
    const newToken = getToken(newEncryptedData, "1d");

    logger.debug(`Session refreshed: ${user.email}`);
    return sendResponse(res, 200, newToken, user);
  } catch (err) {
    logger.error("Refresh Error:", err.message);
    return res.status(401).json({ message: "Session expired" });
  }
};