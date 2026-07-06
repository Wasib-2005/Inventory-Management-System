import { S3Client } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const PROVIDER = process.env.UPLOAD_PROVIDER;

let s3Client = null;

if (PROVIDER === 'S3') {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY,
      secretAccessKey: process.env.MINIO_SECRET_KEY,
    },
    endpoint: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`,
    forcePathStyle: true, 
  });
} else if (PROVIDER === 'CLOUDINARY') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  throw new Error('❌ Storage Configuration Error: Set UPLOAD_PROVIDER to "S3" or "CLOUDINARY" in .env');
}


export { PROVIDER, s3Client, cloudinary };