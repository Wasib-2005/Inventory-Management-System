import logger from "../../config/logger.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";
import {
  checkHasPermissionInRole,
  checkHierarchy,
} from "../../utility/checkRoleForCreatingOrUpdatingRoles.js";
import { hybridDecryption } from "../../utility/encryptionDecryption.js";
import { hashPass } from "../../utility/hash_utility/passHashManager.js";

export const createAccountController = async (req, res) => {
  logger.debug("Req for Create Account");
  try {
    const plain = hybridDecryption(req.body);

    if (!plain.password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const password = await hashPass(plain.password);
    plain.password = password;

    const { role } = plain;

    const getRole = await Role.findOne({ roleTitle: role });

    if (!getRole) {
      logger.error("Role not found");
      return res.status(404).json({ message: "Role not found" });
    }

    const rankCheck = checkHierarchy(req.roleRank, getRole.roleRank);
    if (!rankCheck) {
      return res.status(400).json({
        message:
          "You cannot create a user that has higher rank or equal than you!",
      });
    }

    const hasPermissionForCreatingThisUser = checkHasPermissionInRole(
      req.permission,
      getRole.permissions,
    );

    if (!hasPermissionForCreatingThisUser) {
      return res.status(400).json({
        message:
          "You do not have the permission to create the account with selected role!",
      });
    }

    plain.role = getRole._id;

    if (plain.manager && plain.manager._id) {
      const managerUser = await User.findById(plain.manager._id).select("_id");

      if (!managerUser) {
        return res.status(404).json({ message: "Manager not found!!!" });
      }
      plain.manager = managerUser._id;
    } else {
      delete plain.manager;
    }

    const createUser = await User.create(plain);

    if (!createUser) {
      logger.error("Failed to create account");
      return res.status(500).json({ message: "Failed to create account" });
    }

    return res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    logger.error("Error in create account controller");
    logger.error(error.msg || error.message || error);

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      return res.status(403).json({
        message: `An account with that ${duplicateField} already exists.`,
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
