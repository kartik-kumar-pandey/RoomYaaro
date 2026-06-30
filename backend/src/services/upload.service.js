import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/helpers.js';

export const uploadToCloudinary = (buffer, folder = 'listings') => {
  return new Promise((resolve) => {
    // Convert the image buffer directly to a base64 Data URI
    // This stores the image content directly in the Neon PostgreSQL database under the 'url' field of the 'listing_photos' table
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;
    const mockId = `db-stored-${Date.now()}`;
    resolve({
      url: dataUrl,
      secure_url: dataUrl,
      public_id: mockId,
      publicId: mockId
    });
  });
};

export const deleteFromCloudinary = async (publicId) => {
  // Since images are stored directly in Neon DB as base64 URLs, no external cleanup is required
};
