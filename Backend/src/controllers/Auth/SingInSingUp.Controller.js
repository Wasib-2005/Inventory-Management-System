import mongoose from "mongoose";
import logger from "../../config/logger.js";
import decryptPayload from "../../utility/decryptionData.js";
import { hashPass } from "../../utility/hash_utility/passHashManager.js";
import User from "../../models/user.model.js";

export const singInLogic = async (req, res) => {
  const plain = await decryptPayload(req.body);
  logger.debug(req.body);
  logger.debug(" ");
  logger.debug(plain);
};




export const signUpLogic = async (req, res) => {
  try {
    const plain = await decryptPayload(req.body);
    const { email, password, username } = plain;

    // Check Email in DB
    const findUserInDB = await User.findOne({ email });

    // 409 for existing users
    if (findUserInDB) {
      return res.status(409).json({ message: "An account is already open with this e-mail" });
    }

    // 3. Hash the password 
    const hashedPassword = await hashPass(password);

    // 4. Create and save the user
    const newUser = await User.create({
      ...plain,
      password: hashedPassword
    });

    logger.debug("User created successfully:");
    logger.debug(newUser);

    return res.status(201).json({ 
        message: "User registered successfully", 
        userId: newUser._id 
    });

  } catch (err) {
    logger.error("Signup Error: ", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
