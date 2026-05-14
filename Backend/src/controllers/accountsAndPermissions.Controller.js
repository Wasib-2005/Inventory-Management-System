import logger from "../config/logger.js";
import User from "../models/user.model.js";

export const getAccountsAndPermissions = async (req, res) => {
  try {
    logger.debug("Req for Accounts And Permissions")
    // 1. Use .lean() to get plain JS objects instead of Mongoose Documents
    const users = await User.find().populate("role").lean();

    // 2. Map through the data to reshape it
    const transformedData = users.map(user => {
      // Destructure to separate the fields you want to keep/remove
      const { password, loginAttempts,lockUntil, role, ...rest } = user;

      return {
        ...rest,
        userType: role?.userType,
        permissions: role?.permissions
      };
    });

    res.status(200).send(transformedData);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};