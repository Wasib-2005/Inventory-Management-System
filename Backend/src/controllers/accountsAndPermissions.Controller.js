import logger from "../config/logger.js";
import Role from "../models/role.model.js";
import User from "../models/user.model.js";

export const getAccountsAndPermissions = async (req, res) => {
  try {
    logger.debug("Req for Accounts And Permissions");

    // 1. Destructure query parameters with fallback values
    const {
      page = 1,
      limit = 15,
      username = "",
      email = "",
      phone = "",
      role = "all",
      sortBy = "name-asc",
    } = req.query;

    // 2. Build the dynamic MongoDB filter query object
    const queryFilter = {};

    // Case-insensitive, partial-match text filters
    if (username) {
      queryFilter.username = { $regex: username, $options: "i" };
    }
    if (email) {
      queryFilter.email = { $regex: email, $options: "i" };
    }
    if (phone) {
      queryFilter.phone = { $regex: phone, $options: "i" };
    }

    // Role-specific filtering (assuming req.query.role passes the role name or '_id')
    // Note: If filters pass the Role ID from your dropdown, compare directly.
    if (role && role !== "all") {
      const { _id } = await Role.findOne({ roleTitle: role });
      queryFilter.role = _id;
    }

    // 3. Determine sorting logic
    let sortOptions = {};
    if (sortBy === "name-asc") sortOptions = { username: 1 };
    else if (sortBy === "name-desc") sortOptions = { username: -1 };
    else sortOptions = { createdAt: -1 }; // Default fallback

    // 4. Calculate pagination offsets
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, parseInt(limit, 10));
    const skip = (parsedPage - 1) * parsedLimit;

    // 5. Execute DB query with pagination, sorting, and lean performance optimization
    const users = await User.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .populate("role")
      .lean();

    // 6. Map and sanitize response payloads
    const transformedData = users.map((user) => {
      const {
        password,
        loginAttempts,
        lockUntil,
        role: roleDoc,
        ...rest
      } = user;

      return {
        ...rest,
        // Safeguard in case role population failed or is missing
        roleTitle: roleDoc?.roleTitle || roleDoc?.name || "Unknown",
        permissions: roleDoc?.permissions || [],
      };
    });

    // Send transformed payload to frontend
    res.status(200).json(transformedData);
  } catch (error) {
    logger.error(`Error in getAccountsAndPermissions: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};
