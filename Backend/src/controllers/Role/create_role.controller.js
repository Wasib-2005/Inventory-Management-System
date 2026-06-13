import Role from "../../models/role.model.js";

export const createRole = async (req, res) => {
  const roleData = req.body;

  // 1. Changed to 400 Bad Request (403 is for unauthorized access)
  if (!roleData.roleTitle) {
    return res.status(400).json({ message: "Role Name is required." });
  }

  if (roleData.roleTitle.toLowerCase() === "admin".toLowerCase())
    return res.status(402).json({ message: "Can not create admin" });
  roleData.createdBy = req.userId;
  console.log("Creating role:", roleData);

  try {
    // 2. Used Mongoose's .create() and added the missing 'await'
    const savedRole = await Role.create(roleData);

    // 3. Added the missing success response so the frontend actually finishes loading
    return res.status(201).json({
      message: "Role created successfully!",
      role: savedRole,
    });
  } catch (error) {
    // 4. Filled in the catch block to prevent the server from silently swallowing errors
    console.error("Error creating role:", error);

    // Optional: Handle Mongoose duplicate key error if Role Name must be unique
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "A role with this name already exists." });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
