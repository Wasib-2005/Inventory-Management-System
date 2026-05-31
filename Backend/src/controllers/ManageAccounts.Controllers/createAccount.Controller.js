import logger from "../../config/logger.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";
import { hybridDecryption } from "../../utility/ecryptionDecryption.js";
import { hashPass } from "../../utility/hash_utility/passHashManager.js";

export const createAccountController = async (req, res) => {
  logger.debug("Req for Create Account");
  try {
    const plain = hybridDecryption(req.body);

    const password = await hashPass(plain.password);

    plain.createdBy = req.userId;

    plain.password = password;

    const { role } = plain;

    console.log(role);

    
    const getRoleId = await Role.find({ roleTitle: role });

    if (getRoleId.length === 0) {
      logger.error("Role not found");
      return res.status(404).json({ message: "Role not found" });
    }
    
    plain.role = getRoleId[0]?._id;
    console.log(plain);
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
