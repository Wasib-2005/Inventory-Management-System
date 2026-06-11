import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";
import { hybridDecryption } from "../../utility/ecryptionDecryption.js";

export const updateAccount = async (req, res) => {
  try {
    const data = req.body;
    const plain = hybridDecryption(data);

    // 1. Completely remove permissions
    delete plain.permissions;

    const { roleTitle, manager, _id: userId } = plain;

    // Safety check: Ensure we have a target user ID to update
    if (!userId) {
      return res.status(400).json({ message: "User ID is required for updating account" });
    }

    // 2. Handle Manager Object to ObjectId Mapping
    if (manager && manager._id) {
      // Find the manager by their actual document _id
      const actualManager = await User.findOne({ _id: manager._id, isDeleted: false }).select("_id");
      
      if (!actualManager) {
        return res.status(404).json({ message: "Specified manager not found" });
      }
      
      // Override the manager object with just the clean ObjectId for the schema
      plain.manager = actualManager._id;
    } else {
      delete plain.manager; 
    }

    // 3. Handle Role Title to ObjectId Mapping
    if (!roleTitle) {
      return res.status(400).json({ message: "Role title is required" });
    }

    // Safe lookup: prevents crashing if the roleTitle doesn't exist in DB
    const roleDoc = await Role.findOne({ roleTitle });
    if (!roleDoc) {
      return res.status(404).json({ message: "Specified role not found" });
    }

    plain.role = roleDoc._id;
    delete plain.roleTitle; // Remove string title so it doesn't conflict with schema

    // 4. Clean up metadata / immutable fields from the payload before update
    delete plain._id;
    delete plain.__v;
    delete plain.createdAt;
    delete plain.updatedAt;

    // 5. Execute the Update in the Database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: plain },
      { new: true, runValidators: true }
    ).populate("role").populate("manager", "username displayName email");

    if (!updatedUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    // 6. Send response back
    return res.status(200).json({
      message: "Account updated successfully",
      data: updatedUser,
    });

  } catch (error) {
    console.error("Update Account Error:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};