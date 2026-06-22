import logger from "../../config/logger.js";
import Role from "../../models/role.model.js";
import User from "../../models/user.model.js";

/**
 * Escape regex special characters so user input can't break
 * the MongoDB regex engine or be used for ReDoS injection.
 */
const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
    const rawValue = (match[2] || match[3]).trim();
    if (!rawValue) continue;

    // Safely convert value to case-insensitive regex (escaped)
    const regexVal = { $regex: escapeRegex(rawValue), $options: "i" };

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
        $or: [{ firstName: regexVal }, { lastName: regexVal }],
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
    const generalRegex = { $regex: escapeRegex(generalTerms), $options: "i" };
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

// Whitelisted enum values — must mirror the Mongoose schema enums.
// Keeps bad/unexpected query params from ever reaching the DB query.
const ALLOWED_STATUS = [
  "active",
  "onboarding",
  "on-leave",
  "suspended",
  "terminated",
];
const ALLOWED_TYPE = [
  "full-time",
  "part-time",
  "intern",
  "consultant",
  "contractor",
];
const ALLOWED_GENDER = ["male", "female", "other"];

/**
 * Builds the { employmentStatus, employmentType, gender } portion of the
 * query filter from the request's query params, ignoring "all"/blank/
 * unrecognized values.
 */
const buildEnumFilters = ({ status, type, gender }) => {
  const filters = {};

  if (status && status !== "all" && ALLOWED_STATUS.includes(status)) {
    filters.employmentStatus = status;
  }
  if (type && type !== "all" && ALLOWED_TYPE.includes(type)) {
    filters.employmentType = type;
  }
  if (gender && gender !== "all" && ALLOWED_GENDER.includes(gender)) {
    filters.gender = gender;
  }

  return filters;
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
      status = "all",
      type = "all",
      gender = "all",
    } = req.query;

    // Build standard filters base
    let queryFilter = {};

    // Apply advanced structural token parsing to the search string
    if (search.trim()) {
      queryFilter = parseAdvancedSearch(search);
    }

    // Apply employmentStatus / employmentType / gender filters
    Object.assign(queryFilter, buildEnumFilters({ status, type, gender }));

    // Add soft-delete filter security layer
    queryFilter.isDeleted = false;

    // Process Role-specific structural filters
    if (role && role !== "all") {
      const roleDoc = await Role.findOne({ roleTitle: role });
      if (roleDoc) {
        queryFilter.role = roleDoc._id;
      } else {
        // Unknown role requested — return no results instead of silently
        // ignoring the filter and returning everyone.
        return res.status(200).json([]);
      }
    }

    // Determine sorting options
    let sortOptions = {};
    if (sortBy === "name-asc") sortOptions = { username: 1 };
    else if (sortBy === "name-desc") sortOptions = { username: -1 };
    else sortOptions = { createdAt: -1 };

    // Calculate pagination offsets
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 15);
    const skip = (parsedPage - 1) * parsedLimit;

    // Execute query with database optimizations
    const users = await User.find(queryFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit)
      .populate("role")
      .populate("manager", "displayName username email")
      .lean();

    // Map and sanitize standard data response payloads
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