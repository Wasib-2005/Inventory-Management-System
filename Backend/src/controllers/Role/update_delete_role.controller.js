import Role from "../../models/role.model.js";

export const updateRole = async (req, res) => {
  const roleData = req.body;
  console.log("Incoming update request data:", roleData);

  if (!roleData?._id) {
    return res
      .status(400)
      .json({ message: "Role ID is required for updates." });
  }

  if (roleData.roleTitle.toLowerCase() === "admin".toLowerCase())
    return res.status(402).json({ message: "Can not update admin" });

  try {
    const updatedRole = await Role.findByIdAndUpdate(roleData._id, roleData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.status(200).json({
      message: "Update done",
      role: updatedRole,
    });
  } catch (error) {
    console.error("Error inside updateRole controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteRole = async (req, res) => {
  const { id } = req.query;

  console.log("Attempting to delete role with ID:", id);

  if (!id) {
    return res
      .status(400)
      .json({ message: "Role ID is required in query parameters." });
  }

  try {
    // 1. Fetch the role FIRST to see what we are dealing with
    const roleToDelete = await Role.findById(id);

    if (!roleToDelete) {
      return res
        .status(404)
        .json({ message: "Role not found or already deleted." });
    }

    // 2. NOW we can check the title. If it is admin, block the deletion.
    // (Changed 402 to 403 Forbidden, and updated the error message)
    if (roleToDelete.roleTitle.toLowerCase() === "admin") {
      return res
        .status(403)
        .json({ message: "Cannot delete the core admin role." });
    }

    // 3. If it's not the admin, proceed to delete it
    await Role.findByIdAndDelete(id);

    return res.status(200).json({
      message: `The "${roleToDelete.roleTitle}" role has been successfully deleted.`,
    });
  } catch (error) {
    console.error("Error inside deleteRole controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};