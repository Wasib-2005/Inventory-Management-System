import Product from "../../models/Product.model.js";

const verifyProductData = (data) => {
  const { displayId, sku, name, extraDetails } = data;

  if (!displayId || !sku || !name) {
    return "Missing required root fields: displayId, sku, and name are mandatory.";
  }

  if (extraDetails && Array.isArray(extraDetails)) {
    for (const section of extraDetails) {
      if (!section.header || !Array.isArray(section.body)) {
        return "Invalid extraDetails structure. Every section requires a 'header' and a 'body' array.";
      }

      for (const row of section.body) {
        if (!row.label || !row.value) {
          return "Invalid extraDetails body row. Every item requires a 'label' and a 'value'.";
        }
      }
    }
  }

  return null;
};

const createProduct = async (req, res) => {
  try {
    const validationError = verifyProductData(req.body);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    // displayId,
    //   sku,
    //   name,
    //   brand,
    //   status,
    //   parentProductId,
    //   barcodes,
    //   categoryIds,
    //   supplierIds,
    //   tags,
    //   flags,
    //   uom,
    //   pricing,
    //   compliance,
    //   specifications,
    //   image,
    //   extraDetails,

    const productData = req.body;

    const userId = req.userId;

    productData.createdBy = userId;
    productData.updatedBy = userId;

    const addProductToDB = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product verified and ready for database entry.",
      data: addProductToDB,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error during product creation.",
      error: error.message,
    });
  }
};
