import logger from "../config/logger.js";
import Role from "../models/role.model.js";
import User from "../models/user.model.js";

/**
 * Helper to parse custom targeted queries out of a single text input string.
 * Example: 'address:Dhaka name:"John Doe" regularText'
 */
const parseAdvancedSearch = (searchStr) => {
  if (!searchStr) return {};

  const andConditions = [];
  
  // Regex captures key:value OR key:"value with spaces"
  // It handles text up to the next valid token or the end of the string
  const tokenRegex = /(\w+):\s*(?:"([^"]*)"|(.+?)(?=\s+\w+:|$))/g;
  let match;
  let cleanedSearch = searchStr;

  // 1. Extract and process explicit key-value pairs
  while ((match = tokenRegex.exec(searchStr)) !== null) {
    const key = match[1].toLowerCase();
    const value = (match[2] || match[3]).trim();
    
    // Safely convert value to case-insensitive regex
    const regexVal = { $regex: value, $options: "i" };

    if (key === "address") {
      // Map 'address' keyword against all nested sub-document values
      andConditions.push({
        $or: [
          { "address.street": regexVal },
          { "address.city": regexVal },
          { "address.state": regexVal },
          { "address.country": regexVal },
        ],
      });
    } else if (key === "name") {
      // Map 'name' keyword against both first and last name values
      andConditions.push({
        $or: [
          { firstName: regexVal },
          { lastName: regexVal },
        ],
      });
    } else if (["username", "email", "phone"].includes(key)) {
      // Match explicit properties directly
      andConditions.push({ [key]: regexVal });
    }

    // Strip out processed tokens from the string to evaluate the remainder
    cleanedSearch = cleanedSearch.replace(match[0], "");
  }

  // 2. Process leftover general terms (e.g. text containing no colons)
  const generalTerms = cleanedSearch.trim();
  if (generalTerms) {
    const generalRegex = { $regex: generalTerms, $options: "i" };
    andConditions.push({
      $or: [
        { username: generalRegex },
        { email: generalRegex },
        { firstName: generalRegex },
        { lastName: generalRegex },
      ],
    });
  }

  // Combine conditions safely into an executable MongoDB expression
  return andConditions.length > 0 ? { $and: andConditions } : {};
};

export const getAccountsAndPermissions = async (req, res) => {
  try {
    logger.debug("Req for Accounts And Permissions");

    const {
      page = 1,
      limit = 15,
      role = "all",
      sortBy = "name-asc",
      search = "",
    } = req.query;

    // Build standard filters base
    let queryFilter = {};

    // Apply advanced structural token parsing to the search string
    if (search.trim()) {
      queryFilter = parseAdvancedSearch(search);
    }

    // Add soft-delete filter security layer
    queryFilter.isDeleted = false;

    // Process Role-specific structural filters
    if (role && role !== "all") {
      const roleDoc = await Role.findOne({ roleTitle: role });
      if (roleDoc) {
        queryFilter.role = roleDoc._id;
      }
    }

    // Determine sorting options
    let sortOptions = {};
    if (sortBy === "name-asc") sortOptions = { username: 1 };
    else if (sortBy === "name-desc") sortOptions = { username: -1 };
    else sortOptions = { createdAt: -1 };

    // Calculate pagination offsets
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, parseInt(limit, 10));
    const skip = (parsedPage - 1) * parsedLimit;

    // Execute query with database optimizations
    const users = await User.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .populate("role")
      .lean();

    // Map and sanitize standard data response payloads
    const transformedData = users.map((user) => {
      const { password, loginAttempts, lockUntil, role: roleDoc, ...rest } = user;

      return {
        ...rest,
        roleTitle: roleDoc?.roleTitle || roleDoc?.name || "Unknown",
        permissions: roleDoc?.permissions || [],
      };
    });

    res.status(200).json(transformedData);
  } catch (error) {
    logger.error(`Error in getAccountsAndPermissions: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};