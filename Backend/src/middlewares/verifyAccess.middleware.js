import { verifyAccessToken } from "../utility/tokenService.js";
import logger from "../config/logger.js";

/**
 * Attach to any route that needs authentication.
 * Sets req.userId for downstream handlers.
 */
export const verifyAccess = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    console.log(token)
    if (!token) {
      return res.status(401).json({ message: "No access token" });
    }

    const payload = verifyAccessToken(token); // throws if expired or invalid
    req.userId = payload.sub;
    next();
  } catch (err) {
    logger.warn("Access token invalid:", err.message);
    // Tell the client to refresh — don't log them out
    return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
  }
};