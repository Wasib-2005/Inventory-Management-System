import mongoose from "mongoose";
import logger from "../config/logger.js";
import Role from "../models/role.model.js";
import User from "../models/user.model.js";

export const getRoles = async (req, res) => {
  try {
    // Only fetch userType and exclude the _id field
    const roles = await Role.find().select("userType -_id");

    // map returns a new array directly
    const sendData = roles.map((role) => role.userType);

    res.status(200).json(sendData);
  } catch (error) {
    logger.error("Failed to fetch roles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const changeRoles = async (req, res) => {
  try {
    const { userId, userType } = req.body;

    // 1. Find the Role document that matches the string "userType" (e.g., "admin")
    const roleDoc = await Role.findOne({ userType: userType.toLowerCase() });

    if (!roleDoc) {
      return res.status(404).json({ message: "Role type not found" });
    }

    // 2. Update the user's role field with the ObjectId of the role document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: roleDoc._id },
      { new: true }, // Return the updated document
    ).populate("role"); // Optional: populate if you want to see the new permissions in the response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`Role updated for ${updatedUser.username} to ${userType}`);

    res.status(200).json({
      message: "Role updated successfully",
      userType: userType,
    });
  } catch (error) {
    logger.error("Error in changeRoles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
