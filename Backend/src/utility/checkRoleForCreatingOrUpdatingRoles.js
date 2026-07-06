export const checkHierarchy = (user, target) => {
  return user < target;
};

export const checkHasPermissionInRole = (
  userPermissions,
  newTargetPermissions = {},
  oldTargetPermissions = {},
) => {
  const userObj =
    typeof userPermissions?.toObject === "function"
      ? userPermissions.toObject()
      : userPermissions || {};
  const newTargetObj =
    typeof newTargetPermissions?.toObject === "function"
      ? newTargetPermissions.toObject()
      : newTargetPermissions || {};
  const oldTargetObj =
    typeof oldTargetPermissions?.toObject === "function"
      ? oldTargetPermissions.toObject()
      : oldTargetPermissions || {};

  const keys = Object.keys(newTargetObj);

  const isUpdate = Object.keys(oldTargetObj).length > 0;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (typeof newTargetObj[key] === "boolean") {
      const userHasPermission = !!userObj[key];
      const newSetting = newTargetObj[key];

      if (isUpdate) {
        const oldSetting = !!oldTargetObj[key];

        if (newSetting !== oldSetting) {
          if (!userHasPermission) {
            console.log(
              `Access Denied (Update): User tried to modify '${key}' from ${oldSetting} to ${newSetting} but does not possess it.`,
            );
            return false;
          }
        }
      } else {
        if (newSetting === true && !userHasPermission) {
          console.log(
            `Access Denied (Create): User tried to grant '${key}' but does not possess it.`,
          );
          return false;
        }
      }
    }
  }

  return true;
};
