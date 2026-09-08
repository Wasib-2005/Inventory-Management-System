import { logger } from "../../config/logger.js";
import CycleCount from "../../models/Tasks/CycleCount.model.js";
import EmergencyTask from "../../models/Tasks/EmergencyTask.model.js";

export const createCycleCount = async (req, res) => {
  try {
    const cycleCountData = req.body || {};
    const userId = req.userId;
    const username = req.username;

    if (!cycleCountData.warehouseId || !cycleCountData.countedBy) {
      return res.status(400).json({ success: false, message: "Warehouse and counted-by user are required." });
    }

    if (
      !["all", "specific"].includes(cycleCountData.rackScope) ||
      (cycleCountData.rackScope === "specific" && !cycleCountData.racks?.length)
    ) {
      return res.status(400).json({ success: false, message: "Choose all racks or at least one specific rack." });
    }

    const cycleCount = await CycleCount.create({
      date: cycleCountData.date || new Date(),
      notes: cycleCountData.notes || "",
      warehouseId: cycleCountData.warehouseId,
      countedBy: cycleCountData.countedBy,
      rackScope: cycleCountData.rackScope,
      racks: cycleCountData.rackScope === "all" ? [] : cycleCountData.racks,
      createdBy: userId,
    });
    logger.info(`Cycle count ${cycleCount._id} created by ${username}`);
    return res.status(201).json({ success: true, data: cycleCount });
  } catch (error) {
    logger.error(`Error creating cycle count: ${error.message}`, { error });

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getCycleCounts = async (req, res) => {
  try {
    const query = req.query.warehouseId ? { warehouseId: req.query.warehouseId } : {};
    const data = await CycleCount.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50)
      .populate("warehouseId", "warehouseName")
      .populate("countedBy", "username displayName")
      .populate("createdBy", "username displayName")
      .populate("racks.rackId", "rackCode")
      .populate("racks.shelfId", "shelfCode")
      .populate("discrepancies.recordedBy", "username displayName")
      .populate("verification.verifiedBy", "username displayName")
      .lean();
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    logger.error(`Error fetching cycle counts: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verifyCycleCount = async (req, res) => {
  try {
    const { status, note } = req.body || {};
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be verified or rejected." });
    }
    const data = await CycleCount.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "verification.status": status,
          "verification.note": note || "",
          "verification.verifiedBy": req.userId,
          "verification.verifiedAt": new Date(),
        },
      },
      { new: true, runValidators: true },
    );
    if (!data) return res.status(404).json({ success: false, message: "Cycle count not found." });
    return res.json({ success: true, data });
  } catch (error) {
    logger.error(`Error verifying cycle count: ${error.message}`, { error });
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const recordCycleCountDiscrepancy = async (req, res) => {
  try {
    const { discrepancies } = req.body || {};
    if (!Array.isArray(discrepancies) || discrepancies.length === 0) {
      return res.status(400).json({ success: false, message: "At least one count discrepancy is required." });
    }
    const data = await CycleCount.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          discrepancies: discrepancies.map((item) => ({
            description: item.description,
            expectedQty: item.expectedQty === "" ? undefined : Number(item.expectedQty),
            actualQty: item.actualQty === "" ? undefined : Number(item.actualQty),
            rackCode: item.rackCode,
            shelfCode: item.shelfCode,
            recordedBy: req.userId,
            recordedAt: new Date(),
          })),
          "verification.status": "pending",
        },
      },
      { new: true, runValidators: true },
    );
    if (!data) return res.status(404).json({ success: false, message: "Cycle count not found." });
    await EmergencyTask.create({
      title: `Cycle count mismatch: ${data._id}`,
      description: discrepancies.map((item) => item.description).join("; "),
      priority: "critical",
      relatedType: "cycle_count",
      relatedId: data._id,
      createdBy: req.userId,
    });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not record count discrepancy." });
  }
};
