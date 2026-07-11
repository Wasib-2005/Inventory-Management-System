import { setAuthCookies } from "../../../utility/tokenService.js";

export const sendResponse = (
  res,
  statusCode,
  accessToken,
  refreshToken,
  user,
) => {
  setAuthCookies(res, accessToken, refreshToken);

  const { password, _id, __v, loginAttempts, lockUntil, role, ...cleanedUser } =
    user.toObject();

  const { _id: roleId, __v: roleV, roleName, ...roleData } = role ?? {};

  return res.status(statusCode).json({
    user: {
      ...cleanedUser,
      ...roleData,
    },
  });
};
