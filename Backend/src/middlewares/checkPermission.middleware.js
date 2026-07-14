export const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    const userPermissions = req.permission;

    if (!userPermissions) {
      console.error("[BACKEND] Auth Error: req.permission is undefined.");
      return res.status(403).json({ message: "Permissions not initialized." });
    }

    for (let i = 0; i < requiredPermissions.length; i++) {
      const requiredKey = requiredPermissions[i];

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


