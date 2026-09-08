export const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    const userPermissions = req.permission;
    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    if (!userPermissions) {
      console.error("[BACKEND] Auth Error: req.permission is undefined.");
      return res.status(403).json({ message: "Permissions not initialized." });
    }

    if (req.roleTitle === "admin") {
      return next();
    }

    for (let i = 0; i < required.length; i++) {
      const requiredKey = required[i];

      if (!userPermissions[requiredKey]) {
        console.log(`[BACKEND] Access Denied: Missing ${requiredKey}`);
        return res.status(403).json({
          message: "You do not have the necessary permissions!",
        });
      }
    }

    next();
  };
};
