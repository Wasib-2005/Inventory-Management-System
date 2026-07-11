import mongoose from "mongoose";
import logger from "../../config/logger.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().populate(
      "updatedBy",
      "username email displayName",
    );

    const sendData = roles.map((role) => role.roleTitle);

    res.status(200).json(sendData);
  } catch (error) {
    logger.error("Failed to fetch roles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getRolesForEditing = async (req, res) => {
  try {
    console.log("get-role-for-edit");
    const roles = await Role.find().populate(
      "updatedBy",
      "username email displayName",
    );
    if (!roles) return res.status(404).json({ message: "No role find" });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500);
  }
};
