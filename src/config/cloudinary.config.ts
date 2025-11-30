import { v2 as cloudinary } from "cloudinary";
import config from ".";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
  cloud_name: config.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const deleteImageFromCLoudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      console.log(`File ${public_id} is deleted from cloudinary`);
    }
  } catch (error: any) {
    throw new AppError(401, "Cloudinary image deletion failed", error.message);
  }
};

export const cloudinaryUpload = cloudinary;
