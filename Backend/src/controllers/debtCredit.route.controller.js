import Order from "../models/Order.model.js";

export const getDebtCredit = async (req, res) => {
  try {
    const { type, page, limit } = req.query;
    console.log("Received type:", type);

    if (!type || (type !== "all" && type !== "debt" && type !== "credit")) {
      return res
        .status(400)
        .json({ message: "Invalid or missing type parameter" });
    }

    const data = await Order.find({ dueAmount: { $gt: 0 } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("customerId", "username email phone")
      .select("orderId dueAmount status createdAt updatedAt");

    console.log(data);

    return res.status(200).json({ message: "Data fetched successfully", data });
  } catch (error) {
    console.error("Error fetching debt/credit data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchDebtCredit = async (req, res) => {
  try {
    const { orderid, page = 1, limit = 15 } = req.query;

    if (!orderid) {
      return res.status(400).json({ message: "Missing orderid parameter" });
    }

    const data = await Order.aggregate([
      {
        $match: {
          dueAmount: { $gt: 0 },
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: orderid,
              options: "i",
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);

    const populated = await Order.populate(data, {
      path: "customerId",
      select: "username email phone",
    });

    return res
      .status(200)
      .json({ message: "Data fetched successfully", data: populated });
  } catch (error) {
    console.error("Error searching debt/credit data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const payDebtCredit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!id || !amount) {
      return res
        .status(400)
        .json({ message: "Missing required parameters (id and amount)" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $inc: { dueAmount: -amount } },
      { new: true, runValidators: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({
      message: "Payment successful",
      data: order,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const totalDebt = async (req, res) => {
  try {
    const totalDebt = await Order.aggregate([
      { $match: { dueAmount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: "$dueAmount" } } },
    ]);

    const totalDebtOrderCount = await Order.countDocuments({
      dueAmount: { $gt: 0 },
    });

    const totalOrder = await Order.countDocuments();

    const totalDue = totalDebt.length > 0 ? totalDebt[0].total : 0;

    return res.status(200).json({
      message: "Total debt fetched successfully",
      totalDue,
      totalOrder,
      totalDebtOrderCount,
    });
  } catch (error) {
    console.error("Error fetching total debt:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
