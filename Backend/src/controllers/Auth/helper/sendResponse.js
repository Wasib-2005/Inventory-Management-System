import { setAuthCookies } from "../../../utility/tokenService.js";

// ── Shared: strip sensitive fields and send clean user object ─────────────────
export const sendResponse = (res, statusCode, accessToken, refreshToken, user) => {
  setAuthCookies(res, accessToken, refreshToken);

  const { password, _id, __v, loginAttempts, lockUntil, role, ...cleanedUser } =
    user.toObject();

  // ✅ flatten — pull permissions out of role, drop roleName and role._id
  const { _id: roleId, __v: roleV, roleName, ...roleData } = role ?? {};

  return res.status(statusCode).json({
    user: {
      ...cleanedUser,
      ...roleData, // spreads permissions directly onto user object
    },
  });
};