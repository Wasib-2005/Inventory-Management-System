import User from "../../models/user.model.js";
import { hybridDecryption } from "../../utility/encryptionDecryption.js";

export const updateOwnData = async (req, res) => {
  try {
    // 1. Fetch userId assigned by your token verification middleware
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized access. Token context missing." 
      });
    }

    // 2. Decrypt incoming data payload
    const { body } = req;
    const plain = hybridDecryption(body);

    // 3. Fetch user document from DB to check live permissions
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Strictly check permission flag from the database document
    if (!userDoc.canEditOwnData) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to change your data. Please contact HR.",
      });
    }

    // 4. Extract ONLY basic allowed profile properties (Explicitly dropped timezone)
    const {
      address,
      emergencyContact,
      phone,
      firstName,
      lastName,
      displayName,
      language,
      photoUrl
    } = plain;

    // 5. Update user document & flip permission flag to false immediately (Single use link restriction)
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
          canEditOwnData: false, // Disables further self-editing automatically
          updatedBy: userId, 
        },
      },
      {
        new: true,           // Return fresh, modified document state
        runValidators: true, // Keep enum protections strict
      },
    ).select(
      "-password -passwordChangedAt -passwordResetToken -passwordResetExpires -loginAttempts",
    );

    // 6. Return updated profile state to client
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