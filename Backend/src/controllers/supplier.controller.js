import { logger } from "../config/logger.js";
import Supplier from "../models/supplier.model.js";

export const getSuppliers = async (req, res) => {
  try {
    const { search, limit } = req.query;

    console.log("Search query received:", search); // Debugging line

    let query = {};

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query = {
        $and: [
          { status: { $ne: "Blacklisted" } },
          {
            $or: [
              { suppliersName: searchRegex },
              { supplierCode: searchRegex },
            ],
          },
        ],
      };
    }

    const suppliers = await Supplier.find(query).limit(limit ? parseInt(limit) : 0).sort({ createdAt: -1 });
    logger.info(
      `Fetched ${suppliers.length} suppliers. Search query used: "${search || "none"}"`,
    );

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    logger.error(`Error fetching suppliers: ${error.message}`, { error });

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const createSupplier = async (req, res) => {
  const supplierData = req.body;
  const userId = req.userId;
  const username = req.username;

  logger.info(
    `Supplier creation initiated by User [${userId}]. Code: ${supplierData?.supplierCode}`,
  );

  if (
    !supplierData ||
    !supplierData.suppliersName ||
    !supplierData.supplierCode
  ) {
    logger.warn(
      `Supplier creation rejected: Missing name or code. User [${userId}]`,
    );
    return res.status(400).json({
      success: false,
      message: "Supplier Name and Supplier Code are required fields.",
    });
  }

  if (!supplierData.address?.city || !supplierData.address?.country) {
    logger.warn(
      `Supplier creation rejected: Missing address details. User [${userId}]`,
    );
    return res.status(400).json({
      success: false,
      message: "City and Country are required within the address field.",
    });
  }

  try {
    const existingSupplier = await Supplier.findOne({
      supplierCode: supplierData.supplierCode.toUpperCase().trim(),
    });

    if (existingSupplier) {
      logger.warn(
        `Supplier creation failed: Code "${supplierData.supplierCode}" already exists. User [${userId}]`,
      );
      return res.status(400).json({
        success: false,
        message: `A supplier with code '${supplierData.supplierCode}' already exists.`,
      });
    }

    const newSupplier = new Supplier({
      ...supplierData,
      createdBy: userId,
      updatedBy: userId,
    });

    const savedSupplier = await newSupplier.save();

    logger.info(
      `Supplier "${savedSupplier.suppliersName}" (${savedSupplier.supplierCode}) created successfully by User [${userId}]`,
    );

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      data: savedSupplier,
    });
  } catch (error) {
    logger.error(
      `Error creating supplier for User [${userId}]: ${error.message}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const updateSupplier = async (req, res) => {
  const supplierId = req.params.id;

  // Extract ONLY the fields that users are permitted to update
  const {
    suppliersName,
    supplierCode,
    address,
    contact,
    financials,
    status,
    rating,
    notes,
  } = req.body;

  const userId = req.userId;
  const username = req.username;

  logger.info(
    `Supplier update initiated for ID ${supplierId} by User ${username}:${userId}`,
  );

  try {
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      logger.warn(
        `Supplier update failed: Supplier not found. User [${userId}] for Supplier ID [${supplierId}]`,
      );
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    if (suppliersName !== undefined) supplier.suppliersName = suppliersName;
    if (supplierCode !== undefined) supplier.supplierCode = supplierCode;
    if (status !== undefined) supplier.status = status;
    if (rating !== undefined) supplier.rating = rating;
    if (notes !== undefined) supplier.notes = notes;

    if (address) {
      if (address.street !== undefined)
        supplier.address.street = address.street;
      if (address.city !== undefined) supplier.address.city = address.city;
      if (address.state !== undefined) supplier.address.state = address.state;
      if (address.zipCode !== undefined)
        supplier.address.zipCode = address.zipCode;
      if (address.country !== undefined)
        supplier.address.country = address.country;
    }

    if (contact) {
      if (contact.person !== undefined)
        supplier.contact.person = contact.person;
      if (contact.email !== undefined) supplier.contact.email = contact.email;
      if (contact.phone !== undefined) supplier.contact.phone = contact.phone;
    }

    if (financials && financials.taxId !== undefined) {
      supplier.financials.taxId = financials.taxId;
    }

    supplier.updatedBy = userId;

    const updatedSupplier = await supplier.save();

    logger.info(
      `Supplier "${updatedSupplier.suppliersName}" updated successfully for User [${userId}]`,
    );

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      data: updatedSupplier,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors)
          .map((val) => val.message)
          .join(", "),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Supplier ID format.",
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A supplier with that code already exists.",
      });
    }

    logger.error(
      `Error updating supplier ID ${supplierId} for User [${userId}]: ${error.message}`,
      { error },
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteSupplier = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    `Supplier deletion initiated by User [${userId}] for Supplier ID [${id}]`,
  );

  try {
    const deletedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { isDeleted: true, deleteBy: userId },
      { new: true },
    );

    if (!deletedSupplier) {
      logger.warn(
        `Supplier deletion failed: Supplier not found. User [${userId}] for Supplier ID [${id}]`,
      );
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    logger.info(
      `Supplier "${deletedSupplier.suppliersName}" marked as deleted by User [${userId}]`,
    );

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
      data: deletedSupplier,
    });
  } catch (error) {
    logger.error(
      `Error deleting supplier for User [${userId}] and Supplier ID [${id}]: ${error.message}`,
      { error },
    );
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const restoreSupplier = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  logger.info(
    `Supplier restoration initiated by User [${userId}] for Supplier ID [${id}]`,
  );

  try {
    const restoredSupplier = await Supplier.findByIdAndUpdate(
      id,
      { isDeleted: false, deleteBy: null },
      { new: true },
    );

    if (!restoredSupplier) {
      logger.warn(
        `Supplier restoration failed: Supplier not found. User [${userId}] for Supplier ID [${id}]`,
      );
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    logger.info(
      `Supplier "${restoredSupplier.suppliersName}" restored successfully by User [${userId}]`,
    );

    return res.status(200).json({
      success: true,
      message: "Supplier restored successfully",
      data: restoredSupplier,
    });
  } catch (error) {
    logger.error(
      `Error restoring supplier for User [${userId}] and Supplier ID [${id}]: ${error.message}`,
      { error },
    );
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
