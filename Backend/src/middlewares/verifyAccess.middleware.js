import { verifyAccessToken } from "../utility/tokenService.js";
import {logger} from "../config/logger.js";
import User from "../models/user.model.js";

/**
 * Attach to any route that needs authentication.
 * Sets req.userId for downstream handlers.
 */
export const verifyAccess = async (req, res, next) => {
  try {
    const token = req.cookies?.access_token;
    if (!token) {
      return res.status(401).json({ message: "No access token" });
    }

    const payload = verifyAccessToken(token);
    const userData = await User.findById(payload.sub)
      .select("_id role username isActive isDeleted isVerified employmentStatus")
      .populate("role");

    if (!userData || !userData.role) {
      return res.status(404).json({ message: "User or role not found" });
    }
    if (userData.role.isDeleted) {
      return res.status(403).json({ message: "Assigned role is no longer active" });
    }
    if (
      !userData.isActive ||
      userData.isDeleted ||
      userData.employmentStatus === "suspended" ||
      userData.employmentStatus === "terminated"
    ) {
      return res.status(403).json({ message: "User account is not active" });
    }

    req.userId = userData._id;
    req.username = userData.username;
    req.permission = userData.role.permissions;
    req.roleRank = userData.role.roleRank;
    req.roleTitle = userData.role.roleTitle;

    next();
  } catch (err) {
    logger.warn("Access token invalid:", err.message);

    return res
      .status(401)
      .json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
  }
};
