import multer from "multer";
const storage = multer.memoryStorage();
const uploadConfig = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


