import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";

export const getManagers = async (req, res) => {
  try {
    // 1. Extract the 'search' query parameter sent by the frontend
    const { search } = req.query;

    // 2. Find the manager role document
    const managerRole = await Role.findOne({ roleTitle: "manager" });

    if (!managerRole) {
      return res.status(404).json({ message: "Manager role not found." });
    }

    // 3. Build the base query filtering by the manager role ID
    const query = { role: managerRole._id };

    // 4. If a search term exists, add a fuzzy search condition
    // This matches the search string against displayName, username, or email
    if (search && search.trim() !== "") {
      query.$or = [
        { displayName: { $regex: search, $options: "i" } }, // "i" makes it case-insensitive
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // 5. Execute query and project only the required fields
    const managers = await User.find(query)
      .select("displayName _id email username")
      .limit(10); // Optional: limits results for better dropdown performance

    return res.status(200).json(managers);

  } catch (error) {
    console.error("Error in getManagers:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};