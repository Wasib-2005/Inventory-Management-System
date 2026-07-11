import User from "../../models/user.model.js";
import { hybridDecryption } from "../../utility/encryptionDecryption.js";

export const updateOwnData = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token context missing.",
      });
    }

    const { body } = req;
    const plain = hybridDecryption(body);

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!userDoc.canEditOwnData) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to change your data. Please contact HR.",
      });
    }

    const {
      address,
      emergencyContact,
      phone,
      firstName,
      lastName,
      displayName,
      language,
      photoUrl,
    } = plain;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          address,
          emergencyContact,
          photoUrl,
          phone,
          firstName,
          lastName,
          displayName,
          language,
          canEditOwnData: false,
          updatedBy: userId,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select(
      "-password -passwordChangedAt -passwordResetToken -passwordResetExpires -loginAttempts",
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateOwnData:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred while updating your profile.",
    });
  }
};
