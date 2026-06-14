import Role from "../../models/role.model.js";
import {
  checkHasPermissionInRole,
  checkHierarchy,
} from "../../utility/checkRoleForCreatingOrUpdatingRoles.js";

// ==========================================
// 1. CREATE ROLE
// ==========================================
export const createRole = async (req, res) => {
  const roleData = req.body;

  if (!roleData?.roleTitle) {
    return res.status(400).json({ message: "Role title is required." });
  }

  // Handle both string "0" and numeric 0 safely
  if (!roleData.roleRank || Number(roleData.roleRank) === 0) {
    return res
      .status(400)
      .json({ message: "Role rank is required and cannot be 0." });
  }

  // 1. Hierarchy Check
  const rankCheck = checkHierarchy(req.roleRank, roleData.roleRank);
  if (!rankCheck) {
    return res.status(403).json({
      message: "Forbidden: You cannot create a role with a higher or equal privilege rank than your own.",
    });
  }

  // 2. Permission Check
  const hasPermissionForCreatingRole = checkHasPermissionInRole(
    req.permission,
    roleData.permissions
  );
  if (!hasPermissionForCreatingRole) {
    return res.status(400).json({
      message: "You do not have the permission to create a role with these privileges.",
    });
  }

  // 3. Admin Identity Check
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

// ==========================================
// 2. UPDATE ROLE
// ==========================================
export const updateRole = async (req, res) => {
  const roleData = req.body;

  if (!roleData?._id) {
    return res.status(400).json({ message: "Role ID is required for updates." });
  }

  try {
    // FIX 1: Fetch and check existence FIRST to prevent application crashes
    const roleInDD = await Role.findById(roleData._id);
    if (!roleInDD) {
      return res.status(404).json({ message: "Role not found." });
    }

    // FIX 2: Check if the role being targeted is the core Admin role
    if (roleInDD.roleTitle.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Action Forbidden: Cannot update the core Admin role." });
    }

    // FIX 3: Prevent renaming an existing role TO "admin"
    if (roleData.roleTitle && roleData.roleTitle.toLowerCase() === "admin") {
      return res.status(400).json({ message: "Cannot rename a role to 'Admin'." });
    }

    // Fallback to existing rank if not explicitly changing it in payload
    const targetRank = roleData.roleRank || roleInDD.roleRank;

    // 1. Hierarchy Check
    const rankCheck = checkHierarchy(req.roleRank, targetRank);
    if (!rankCheck) {
      return res.status(403).json({
        message: "Forbidden: You cannot modify a role to a higher or equal privilege rank than your own.",
      });
    }

    // 2. Permission Check (Passing old database permissions correctly)
    const hasPermissionForUpdatingRole = checkHasPermissionInRole(
      req.permission,
      roleData.permissions || roleInDD.permissions, // fallback if payload omitted permissions
      roleInDD.permissions
    );
    if (!hasPermissionForUpdatingRole) {
      return res.status(400).json({
        message: "You do not have the permission for updating this role's privileges.",
      });
    }

    const updatedRole = await Role.findByIdAndUpdate(roleData._id, roleData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Update completed successfully.",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error inside updateRole controller:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ==========================================
// 3. DELETE ROLE
// ==========================================
export const deleteRole = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Role ID is required in query parameters." });
  }

  try {
    const roleToDelete = await Role.findById(id);
    if (!roleToDelete) {
      return res.status(404).json({ message: "Role not found or already deleted." });
    }

    if (roleToDelete.roleTitle.toLowerCase() === "admin") {
      return res.status(403).json({ message: "Cannot delete the core Admin role." });
    }

    // FIX 4: Add Hierarchy protection so lower roles cannot delete equal/higher roles
    const rankCheck = checkHierarchy(req.roleRank, roleToDelete.roleRank);
    if (!rankCheck) {
      return res.status(403).json({
        message: "Forbidden: You cannot delete a role that has a higher or equal privilege rank than your own.",
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