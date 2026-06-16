export const checkHierarchy = (user, target) => {
  return user < target;
}

export const checkHasPermissionInRole = (userPermissions, newTargetPermissions = {}, oldTargetPermissions = {}) => {
  // Safe extraction (handles Mongoose documents or raw objects gracefully)
  const userObj = typeof userPermissions?.toObject === "function" ? userPermissions.toObject() : (userPermissions || {});
  const newTargetObj = typeof newTargetPermissions?.toObject === "function" ? newTargetPermissions.toObject() : (newTargetPermissions || {});
  const oldTargetObj = typeof oldTargetPermissions?.toObject === "function" ? oldTargetPermissions.toObject() : (oldTargetPermissions || {});

  const keys = Object.keys(newTargetObj);
  
  // If oldTargetObj has keys, we are performing an UPDATE. Otherwise, it's a CREATE.
  const isUpdate = Object.keys(oldTargetObj).length > 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (typeof newTargetObj[key] === "boolean") {
      const userHasPermission = !!userObj[key];
      const newSetting = newTargetObj[key];

      if (isUpdate) {
        // --- UPDATE LOGIC ---
        const oldSetting = !!oldTargetObj[key];

        // Has this specific permission been modified (either granted or revoked)?
        if (newSetting !== oldSetting) {
          // Rule: If you don't possess a permission, you cannot modify its state in any role
          if (!userHasPermission) {
            console.log(`Access Denied (Update): User tried to modify '${key}' from ${oldSetting} to ${newSetting} but does not possess it.`);
            return false; 
          }
        }
      } else {
        // --- CREATION LOGIC ---
        // Rule: If you don't possess a permission, you cannot hand it out (set it to true)
        if (newSetting === true && !userHasPermission) {
          console.log(`Access Denied (Create): User tried to grant '${key}' but does not possess it.`);
          return false; 
        }
      }
    }
  }

  return true; // Authorization successful
};