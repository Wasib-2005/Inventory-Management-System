import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  PROVIDER,
  s3Client,
  cloudinary,
} from "../../config/connectImageStorage.js";
import { uploadImages } from "./uploadImages.js";
import { logger } from "../../config/logger.js";

export const replaceImages = async (oldImageUrl, newImageFile, destination) => {
  let newImageUrl = null;

  try {
    logger.debug("Step 1: Uploading new image...");
    const uploadResult = await uploadImages(newImageFile, destination);
    newImageUrl = uploadResult[0];

    if (!oldImageUrl) {
      logger.debug("No old image provided. Replacement finished.");
      return newImageUrl;
    }

    logger.debug("Step 2: Analyzing old image source for deletion...");

    if (oldImageUrl.includes("cloudinary.com")) {
      logger.debug("Targeting Cloudinary deletion...");
      const parts = oldImageUrl.split("/image/upload/");
      if (parts.length >= 2) {
        const pathAfterUpload = parts[1];
        const cleanPath = pathAfterUpload.replace(/^v\d+\//, "");
        const publicId = cleanPath.substring(0, cleanPath.lastIndexOf("."));

        logger.debug(`Deleting from Cloudinary with Public ID: [${publicId}]`);
        await cloudinary.uploader.destroy(publicId);
      } else {
        logger.warn("Could not parse Cloudinary URL format. Deletion skipped.");
      }
    } else if (oldImageUrl.startsWith("http")) {
      logger.debug("Targeting S3/MinIO full URL deletion...");
      const parsedUrl = new URL(oldImageUrl);
      const relativePath = parsedUrl.pathname.slice(1);

      const prefix = `${destination}/`;
      let fileKey = relativePath;
      if (relativePath.startsWith(prefix)) {
        fileKey = relativePath.substring(prefix.length);
      }

      logger.debug(
        `Deleting from S3 Bucket [${destination}] with Key: [${fileKey}]`,
      );
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: destination,
          Key: fileKey,
        }),
      );
    } else {
      logger.debug("Targeting S3/MinIO relative path deletion...");
      const prefix = `${destination}/`;
      let fileKey = oldImageUrl;

      if (oldImageUrl.startsWith(prefix)) {
        fileKey = oldImageUrl.substring(prefix.length);
      }

      logger.debug(
        `Deleting from S3 Bucket [${destination}] with Key: [${fileKey}]`,
      );
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: destination,
          Key: fileKey,
        }),
      );
    }

    logger.debug("Image replacement successful!");
    return newImageUrl;
  } catch (error) {
    logger.error(`Error inside replaceImages utility: ${error.message || error}`);
    if (newImageUrl) {
      logger.debug(
        "Deletes failed, but returning new image URL to avoid breaking the update flow.",
      );
      return newImageUrl;
    }
    throw error;
  }
};