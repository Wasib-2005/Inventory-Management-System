import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";

export const getManagers = async (req, res) => {
  try {
    const { search } = req.query;

    const managerRole = await Role.findOne({ roleTitle: "manager" });

    if (!managerRole) {
      return res.status(404).json({ message: "Manager role not found." });
    }

    const query = { role: managerRole._id };

    if (search && search.trim() !== "") {
      query.$or = [
        { displayName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const managers = await User.find(query)
      .select("displayName _id email username")
      .limit(10);

    return res.status(200).json(managers);
  } catch (error) {
    console.error("Error in getManagers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
