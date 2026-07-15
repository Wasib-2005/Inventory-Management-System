import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  PROVIDER,
  s3Client,
  cloudinary,
} from "../../config/connectImageStorage.js";
import { generateImageName } from "./imageNameGenetator.js";
import { logger } from "../../config/logger.js";

async function uploadToS3(file, bucket) {
  const fileKey = generateImageName(file);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  const url = `${bucket}/${fileKey}`;
  return { url, key: fileKey };
}

async function uploadToCloudinary(file, folder) {
  const base64Data = file.buffer.toString("base64");
  const fileUri = `data:${file.mimetype};base64,${base64Data}`;
  const secureNameWithExt = generateImageName(file);
  const secureNameWithoutExt = secureNameWithExt.substring(
    0,
    secureNameWithExt.lastIndexOf("."),
  );

  const result = await cloudinary.uploader.upload(fileUri, {
    folder: folder,
    public_id: secureNameWithoutExt,
    use_filename: true,
    unique_filename: false,
    timeout: 30000,
  });
  console.log(result.secure_url);
  return { url: result.secure_url, key: result.public_id };
}

/**
 * Main Upload Service
 * @param {Object|Object[]} files - Single file object or array of files from Multer
 * @param {string} destination - Target destination (S3 bucket name or Cloudinary folder name)
 * @returns {Promise<string[]>} Array of public URLs
 */
export async function uploadImages(files, destination) {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    throw new Error("No files provided for upload.");
  }

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
    logger.error(
      `Upload execution aborted using ${PROVIDER}. Reverting changes...`,
    );
    console.log(error);

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
