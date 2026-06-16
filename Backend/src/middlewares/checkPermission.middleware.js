// checkPermission.middleware.js

const checkPermission = (requiredPermissions) => {
  return async (req, res, next) => {
    // 1. Grab the permissions object (fallback to empty object if undefined)
    const userPermissions = req.permission; 

    // 2. Safety guard: If permissions aren't loaded at all, deny access
    if (!userPermissions) {
      console.error("[BACKEND] Auth Error: req.permission is undefined.");
      return res.status(403).json({ message: "Permissions not initialized." });
    }

    // 3. Validate every required permission against the user's permission object
    for (let i = 0; i < requiredPermissions.length; i++) {
      const requiredKey = requiredPermissions[i];

      // If the key doesn't exist, or is explicitly false, block them
      if (!userPermissions[requiredKey]) {
        console.log(`[BACKEND] Access Denied: Missing ${requiredKey}`);
        return res.status(403).json({ 
          message: "You do not have the necessary permissions!" 
        });
      }
    }

    // 4. If it passes all checks, move forward
    next();
  };
};

module.exports = { checkPermission };