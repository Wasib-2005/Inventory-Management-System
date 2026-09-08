import EmergencyTask from "../../models/Tasks/EmergencyTask.model.js";

export const getEmergencyTasks = async (req, res) => {
  try {
    const data = await EmergencyTask.find({})
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 100)
      .populate("assignedTo", "username displayName")
      .populate("createdBy", "username displayName")
      .lean();
    return res.json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};

export const createEmergencyTask = async (req, res) => {
  try {
    const { title, description, priority, relatedType, relatedId, assignedTo } = req.body || {};
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    const data = await EmergencyTask.create({
      title,
      description,
      priority: priority || "high",
      relatedType: relatedType || "manual",
      relatedId: relatedId || undefined,
      assignedTo: assignedTo || undefined,
      createdBy: req.userId,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not create emergency task." });
  }
};

export const updateEmergencyTask = async (req, res) => {
  try {
    const allowed = ["status", "assignedTo", "resolution"];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.status === "resolved") updates.resolvedAt = new Date();
    const data = await EmergencyTask.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!data) return res.status(404).json({ success: false, message: "Emergency task not found." });
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not update emergency task." });
  }
};
