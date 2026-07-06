import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  PROVIDER,
  s3Client,
  cloudinary,
} from "../../config/connectImageStorage.js";

async function uploadToS3(file, bucket) {
  const fileKey = `${Date.now()}-${file.originalname}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const url = `${process.env.MINIO_PUBLIC_URL}/${bucket}/${fileKey}`;
  return { url, key: fileKey };
}


async function uploadToCloudinary(file, folder) {
  const base64Data = file.buffer.toString("base64");
  const fileUri = `data:${file.mimetype};base64,${base64Data}`;

  const result = await cloudinary.uploader.upload(fileUri, { folder: folder });
  return { url: result.secure_url, key: result.public_id };
}

/**
 * Main Upload Service
 * @param {Object|Object[]} files - Single file object or array of files from Multer
 * @param {string} destination - Target destination (S3 bucket name or Cloudinary folder name)
 * @returns {Promise<string[]>} Array of public URLs
 */
export async function upload(files, destination) {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    throw new Error("No files provided for upload.");
  }

  // Uniformity: Ensure input is treated as an array
  const fileArray = Array.isArray(files) ? files : [files];
  const transientUploads = []; 
  const urlResults = [];

  try {
    for (const file of fileArray) {
      let result;

      if (PROVIDER === "S3") {
        result = await uploadToS3(file, destination);
      } else {
        result = await uploadToCloudinary(file, destination);
      }

      transientUploads.push(result);
      urlResults.push(result.url);
    }

    return urlResults;
  } catch (error) {
    console.error(
      `Upload execution aborted using ${PROVIDER}. Reverting changes...`,
    );

    for (const item of transientUploads) {
      try {
        if (PROVIDER === "S3") {
          await s3Client.send(
            new DeleteObjectCommand({ Bucket: destination, Key: item.key }),
          );
        } else {
          await cloudinary.uploader.destroy(item.key);
        }
      } catch (cleanupError) {
        console.error(`Failed clearing file key: ${item.key}`, cleanupError);
      }
    }

    throw new Error(`Storage pipeline failure: ${error.message}`);
  }
}
