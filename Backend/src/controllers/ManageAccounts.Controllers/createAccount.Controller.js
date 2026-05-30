import logger from "../../config/logger.js";
import User from "../../models/user.model.js";
import { hybridDecryption } from "../../utility/ecryptionDecryption.js";

export const createAccountController = async (req, res) => {
  logger.debug("Req for Create Account");
  try {
    const plain = hybridDecryption(req.body);

    const createUser = await User.create(plain);

    if (!createUser) {
      logger.error("Failed to create account");
      return res.status(500).json({ message: "Failed to create account" });
    }

    return res.status(200).json({ message: "Account created successfully" });
  } catch (error) {
    logger.error("Error in create account controller");
    logger.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
