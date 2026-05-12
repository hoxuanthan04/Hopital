import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const name = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

if (name && key && secret) {
  cloudinary.config({
    cloud_name: name,
    api_key: key,
    api_secret: secret,
  });
}

export function isCloudinaryConfigured() {
  return Boolean(name && key && secret);
}

export { cloudinary };
