import Violation from "../../models/violation.model.js";
import { logger } from "../../config/logger.js";

/**
 * @typedef {Object} WhereTarget
 * @property {import("mongoose").Types.ObjectId | string} id - Target entity ID (e.g., Product, User, Warehouse)
 * @property {string} entityType - Collection/entity type name (e.g., "Product", "User", "Warehouse")
 */

/**
 * @typedef {Object} ViolationWhat
 * @property {string} type - Identifier (e.g., "ITEM_PRICE_MISMATCH", "SUBTOTAL_MISMATCH")
 * @property {string} [description] - Human-readable explanation of the violation
 * @property {Record<string, any>} [metadata] - Extra contextual details (e.g., submittedPrice, expectedMrp)
 */

/**
 * @typedef {Object} ViolationByWho
 * @property {import("mongoose").Types.ObjectId | string | null} [user] - User ID who performed the action
 * @property {string} [role] - User role (e.g., "USER", "ADMIN")
 * @property {string} [ipAddress] - IP address of the requester
 */

/**
 * @typedef {Object} ViolationInput
 * @property {WhereTarget[]} where - Target entities linked to this violation
 * @property {ViolationWhat} what - What violation occurred
 * @property {ViolationByWho} [byWho] - Who triggered the violation
 * @property {number} violationLevel - Severity level (1 = Highest/Block, 3 = Warning)
 */

/**
 * Saves violation documents to MongoDB in batch.
 *
 * @param {ViolationInput[]} violationData - Array of violation objects to persist
 * @returns {Promise<import("mongoose").Document[] | null>} Array of saved Mongoose violation documents
 */
export const saveViolation = async (violationData) => {
  try {
    if (!violationData || violationData.length === 0) {
      return null;
    }

    const saved = await Violation.insertMany(violationData);

    logger.info(
      { count: saved.length },
      "Successfully persisted order violations to database",
    );

    return saved;
  } catch (err) {
    logger.error(
      { err, violationCount: violationData?.length },
      "Failed to save order violations to database",
    );
    throw err;
  }
};