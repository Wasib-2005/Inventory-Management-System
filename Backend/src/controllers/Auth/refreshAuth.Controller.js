import logger from "../../config/logger.js";
import User from "../../models/user.model.js";
import { clearAuthCookies, generateAccessToken, rotateRefreshToken } from "../../utility/tokenService.js";
import { sendResponse } from "./helper/sendResponse.js";

// ── REFRESH ───────────────────────────────────────────────────────────────────
export const refreshAuth = async (req, res) => {
  try {
    const rawRefresh = req.cookies?.refresh_token;
    if (!rawRefresh) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const { userId, newRefreshToken } = await rotateRefreshToken(rawRefresh);

    const user = await User.findById(userId).populate("role");
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