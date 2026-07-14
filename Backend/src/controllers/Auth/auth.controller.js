import crypto from "crypto";
import User from "../../models/user.model.js";
import RefreshToken from "../../models/refreshToken.model.js";
import {logger} from "../../config/logger.js";
import {
  hashPass,
  compHashPass,
} from "../../utility/hash_utility/passHashManager.js";
import {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  rotateRefreshToken,
  verifyAccessToken,
  setAuthCookies,
  clearAuthCookies,
} from "../../utility/tokenService.js";
import Role from "../../models/role.model.js";
import { sendResponse } from "./helper/sendResponse.js";
import { hybridDecryption } from "../../utility/encryptionDecryption.js";

export const signUpLogic = async (req, res) => {
  return res.status(404).send("");
  try {
    const plain = hybridDecryption(req.body);
    const { email, password } = plain;

    if (await User.findOne({ email })) {
      return res.status(409).json({ message: "An account already exists" });
    }

    const defaultRole = await Role.findOne({ roleTitle: "user" });

    if (!defaultRole) {
      return res.status(500).json({ message: "Default role not configured" });
    }

    const hashedPassword = await hashPass(password);
    const newUser = await User.create({
      ...plain,
      password: hashedPassword,
      role: defaultRole._id,
    });

    await newUser.populate("role");

    const family = crypto.randomUUID();
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

export const signInLogic = async (req, res) => {
  try {
    const plain = hybridDecryption(req.body);

    const { email, password } = plain;

    const user = await User.findOne({ email }).populate("role");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isLocked) {
      const remaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(429).json({
        message: `Account locked. Try again in ${remaining} minute(s).`,
      });
    }

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

export const logout = async (req, res) => {
  try {
    const rawRefresh = req.cookies?.refresh_token;

    if (rawRefresh) {
      const crypto = await import("crypto");
      const hash = crypto.createHash("sha256").update(rawRefresh).digest("hex");
      await RefreshToken.deleteOne({ tokenHash: hash });
    }

    clearAuthCookies(res);
    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    logger.error("Logout Error:", err);
    clearAuthCookies(res);
    return res.status(200).json({ message: "Logged out" });
  }
};
