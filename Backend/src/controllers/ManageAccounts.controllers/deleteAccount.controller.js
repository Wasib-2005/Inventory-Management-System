import User from "../../models/user.model.js";
import mongoose from "mongoose";

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "User ID is required." });
    }

    if (req.userId.toString() === id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }

    const user = await User.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found or already deleted." });
    }

    await User.updateOne(
      { _id: user._id, isDeleted: { $ne: true } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.userId,
          updatedBy: req.userId,
          isActive: false,
        },
      },
    );

    return res.status(200).json({
      message: "User has been moved to the recycle bin.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getDeletedAccounts = async (req, res) => {
  const users = await User.find({ isDeleted: true })
    .select("-password -loginAttempts -lockUntil")
    .sort({ deletedAt: -1 })
    .populate("deletedBy", "username displayName email")
    .populate("role", "roleTitle")
    .lean();
  return res.status(200).json({ success: true, data: users });
};

export const restoreAccount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  const result = await User.updateOne(
    { _id: id, isDeleted: true },
    {
      $set: { isDeleted: false, isActive: true, updatedBy: req.userId },
      $unset: { deletedAt: "", deletedBy: "" },
    },
  );
  if (!result.matchedCount) {
    return res.status(404).json({ message: "Deleted user not found." });
  }
  return res.status(200).json({ message: "User restored successfully." });
};
