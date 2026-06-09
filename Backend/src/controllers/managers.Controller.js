import Role from "../models/role.model.js";
import User from "../models/user.model.js";

export const getManagers = async (req, res) => {
  try {
    // 1. Find the manager role document
    const managerRole = await Role.findOne({ roleTitle: "manager" });

    // Handle case where the role doesn't exist in the DB yet
    if (!managerRole) {
      return res.status(404).json({ message: "Manager role not found." });
    }

    // 2. Find users matching the role ID and chain .select() for specific fields
    // Passing string fields separated by a space: 'displayName _id'
    const managers = await User.find({ role: managerRole._id })
      .select("displayName _id");

    // 3. Return the response to the client
    return res.status(200).json(managers);

  } catch (error) {
    console.error("Error in getManagers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};