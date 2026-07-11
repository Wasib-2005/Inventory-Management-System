import logger from "../config/logger.js";
import Supplier from "../models/supplier.model.js";

export const getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;

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

    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
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
