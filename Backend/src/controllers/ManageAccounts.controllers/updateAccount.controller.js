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

    delete plain.permissions;

    const { roleTitle, manager, _id: userId } = plain;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required for updating account" });
    }

    const existingUser = await User.findById(userId).populate("role");
    if (!existingUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

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

    if (roleTitle) {
      const roleDoc = await Role.findOne({ roleTitle });
      if (!roleDoc) {
        return res.status(404).json({ message: "Specified role not found" });
      }

      const rankCheck = checkHierarchy(req.roleRank, roleDoc.roleRank);
      if (!rankCheck) {
        return res.status(400).json({
          message:
            "You cannot change this user role because you are lower than the selected user rank!",
        });
      }

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

    delete plain._id;
    delete plain.__v;
    delete plain.createdAt;

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
