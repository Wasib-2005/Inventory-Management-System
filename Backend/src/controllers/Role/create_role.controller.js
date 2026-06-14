import Role from "../../models/role.model.js";
import {
  checkHasPermissionInRole,
  checkHierarchy,
} from "../../utility/checkRoleForCreatingOrUpdatingRoles.js";

export const createRole = async (req, res) => {
  const roleData = req.body;

  if (!roleData.roleTitle) {
    return res.status(400).json({ message: "Role title is required." });
  }

  // Check if roleRank is missing or explicitly 0
  if (!roleData.roleRank || roleData.roleRank === String(0)) {
    return res
      .status(400)
      .json({ message: "Role rank is required and cannot be 0." });
  }

  const rankCheck = checkHierarchy(req.roleRank, roleData.roleRank);

  const hasPermissionForCreatingRole = checkHasPermissionInRole(
    req.permission,
    roleData.permissions,
  );

  if (!hasPermissionForCreatingRole)
    return res.status(400).json({
      message: "You do not have the permission for creating this role.",
    })

  // CRITICAL FIX: Added 'return' here so execution stops on failure
  if (!rankCheck) {
    return res.status(403).json({
      message:
        "Forbidden: You cannot create a role with a higher or equal privilege rank than your own.",
    });
  }

  // Spelling fix: "admin".toLowerCase() is already lowercase, no need to lower both sides
  if (roleData.roleTitle.toLowerCase() === "admin") {
    return res
      .status(400)
      .json({ message: "Cannot create an additional Admin role." });
  }

  roleData.createdBy = req.userId;

  try {
    const savedRole = await Role.create(roleData);

    return res.status(201).json({
      message: "Role created successfully!",
      role: savedRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A role with this name already exists." });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};
