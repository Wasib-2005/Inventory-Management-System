import Role from "../../models/role.model.js";
import {
  checkHasPermissionInRole,
  checkHierarchy,
} from "../../utility/checkRoleForCreatingOrUpdatingRoles.js";

export const createRole = async (req, res) => {
  const roleData = req.body;

  if (!roleData?.roleTitle) {
    return res.status(400).json({ message: "Role title is required." });
  }

  if (!roleData.roleRank || Number(roleData.roleRank) === 0) {
    return res
      .status(400)
      .json({ message: "Role rank is required and cannot be 0." });
  }

  const rankCheck = checkHierarchy(req.roleRank, roleData.roleRank);
  if (!rankCheck) {
    return res.status(403).json({
      message:
        "Forbidden: You cannot create a role with a higher or equal privilege rank than your own.",
    });
  }

  const hasPermissionForCreatingRole = checkHasPermissionInRole(
    req.permission,
    roleData.permissions,
  );
  if (!hasPermissionForCreatingRole) {
    return res.status(400).json({
      message:
        "You do not have the permission to create a role with these privileges.",
    });
  }

  if (roleData.roleTitle.toLowerCase() === "admin") {
    return res
      .status(400)
      .json({ message: "Cannot create an additional Admin role." });
  }

  try {
    roleData.createdBy = req.userId;
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

export const updateRole = async (req, res) => {
  const roleData = req.body;

  if (!roleData?._id) {
    return res
      .status(400)
      .json({ message: "Role ID is required for updates." });
  }

  try {
    const roleInDD = await Role.findById(roleData._id);
    if (!roleInDD) {
      return res.status(404).json({ message: "Role not found." });
    }

    if (roleInDD.roleTitle.toLowerCase() === "admin") {
      return res.status(403).json({
        message: "Action Forbidden: Cannot update the core Admin role.",
      });
    }

    if (roleData.roleTitle && roleData.roleTitle.toLowerCase() === "admin") {
      return res
        .status(400)
        .json({ message: "Cannot rename a role to 'Admin'." });
    }

    const targetRank = roleData.roleRank || roleInDD.roleRank;

    const rankCheck = checkHierarchy(req.roleRank, targetRank);

    console.log("Hierarchy Check", rankCheck);
    if (!rankCheck) {
      return res.status(403).json({
        message:
          "Forbidden: You cannot modify a role to a higher or equal privilege rank than your own.",
      });
    }

    const hasPermissionForUpdatingRole = checkHasPermissionInRole(
      req.permission,
      roleData.permissions || roleInDD.permissions,
      roleInDD.permissions,
    );
    if (!hasPermissionForUpdatingRole) {
      return res.status(400).json({
        message:
          "You do not have the permission for updating this role's privileges.",
      });
    }

    roleData.updatedBy = req.userId;

    const updatedRole = await Role.findByIdAndUpdate(roleData._id, roleData, {
      new: true,
      runValidators: true,
    }).populate("updatedBy", "username email displayName");

    return res.status(200).json({
      message: "Update completed successfully.",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error inside updateRole controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRole = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Role ID is required in query parameters." });
  }

  try {
    const roleToDelete = await Role.findById(id);
    if (!roleToDelete) {
      return res
        .status(404)
        .json({ message: "Role not found or already deleted." });
    }

    if (roleToDelete.roleTitle.toLowerCase() === "admin") {
      return res
        .status(403)
        .json({ message: "Cannot delete the core Admin role." });
    }

    const rankCheck = checkHierarchy(req.roleRank, roleToDelete.roleRank);
    if (!rankCheck) {
      return res.status(403).json({
        message:
          "Forbidden: You cannot delete a role that has a higher or equal privilege rank than your own.",
      });
    }

    await Role.findByIdAndDelete(id);

    return res.status(200).json({
      message: `The "${roleToDelete.roleTitle}" role has been successfully deleted.`,
    });
  } catch (error) {
    console.error("Error inside deleteRole controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
