import { v2 as cloudinary } from 'cloudinary';

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Konfigurasi Cloudinary (.env.local) belum lengkap. Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET sudah diatur.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Uploads a base64 image string to Cloudinary
 * @param base64Data Data URL (e.g. data:image/jpeg;base64,...) or plain base64 string
 * @param folder Folder name in Cloudinary (default: 'attendance')
 * @returns Secure URL of the uploaded image
 */
export async function uploadBase64Image(base64Data: string, folder = 'attendance'): Promise<string> {
  const cld = getCloudinary();

  // If plain base64 without data URI prefix, add it
  const formattedData = base64Data.startsWith('data:')
    ? base64Data
    : `data:image/jpeg;base64,${base64Data}`;

  const result = await cld.uploader.upload(formattedData, {
    folder,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ],
  });

  return result.secure_url;
}
