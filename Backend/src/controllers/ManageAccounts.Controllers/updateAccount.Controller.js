import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";
import {
  checkHasPermissionInRole,
  checkHierarchy,
} from "../../utility/checkRoleForCreatingOrUpdatingRoles.js";
import { hybridDecryption } from "../../utility/encryptionDecryption.js";

export const updateAccount = async (req, res) => {
  try {
    const data = req.body;
    const plain = hybridDecryption(data);

    // 1. Completely remove permissions from root payload to prevent hijacking
    delete plain.permissions;

    const { roleTitle, manager, _id: userId } = plain;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required for updating account" });
    }

    // Fetch existing target user to compare roles/permissions during update
    const existingUser = await User.findById(userId).populate("role");
    if (!existingUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // 2. Handle Manager Object to ObjectId Mapping
    if (manager && manager._id) {
      const actualManager = await User.findOne({
        _id: manager._id,
        isDeleted: false,
      }).select("_id");

      if (!actualManager) {
        return res.status(404).json({ message: "Specified manager not found" });
      }
      plain.manager = actualManager._id;
    } else {
      delete plain.manager;
    }

    // 3. Handle Role Title to ObjectId Mapping (If provided)
    if (roleTitle) {
      const roleDoc = await Role.findOne({ roleTitle });
      if (!roleDoc) {
        return res.status(404).json({ message: "Specified role not found" });
      }

      // Hierarchy validation check
      const rankCheck = checkHierarchy(req.roleRank, roleDoc.roleRank);
      if (!rankCheck) {
        return res.status(400).json({
          message:
            "You cannot change this user role because you are lower than the selected user rank!",
        });
      }

      // Permission delta check (Pass original role permissions vs new role permissions)

      console.log(existingUser.role?.permissions);
      const hasPermissionForChangeThisUser = checkHasPermissionInRole(
        req.permission,
        roleDoc.permissions,
        existingUser.role?.permissions || {},
      );

      if (!hasPermissionForChangeThisUser) {
        return res.status(400).json({
          message:
            "You cannot change this user permission because you do not have necessary permissions",
        });
      }

      plain.role = roleDoc._id;
      delete plain.roleTitle;
    }

    // 4. Clean up metadata / immutable fields
    delete plain._id;
    delete plain.__v;
    delete plain.createdAt;

    // 5. Execute the Update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: plain },
      { new: true, runValidators: true },
    )
      .populate("role")
      .populate("manager", "username displayName email");

    return res.status(200).json({
      message: "Account updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update Account Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
