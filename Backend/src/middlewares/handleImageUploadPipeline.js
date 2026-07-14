import multer from "multer";
const storage = multer.memoryStorage();
const uploadConfig = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export const imageUploadPipeline = async (req, res, next) => {
  uploadConfig.any()(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size limit exceeded. Maximum allowed size is 5MB.",
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    next();
  });
};
