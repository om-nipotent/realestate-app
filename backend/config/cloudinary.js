/**
 * File storage — uses real Cloudinary on Vercel (or when env vars are set),
 * falls back to local file storage for development.
 * Exports the same function signatures so controllers need no changes.
 */
const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

// ─── Check if real Cloudinary is configured ───────────────────────────────────
const hasCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let cloudinary;
if (hasCloudinary) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Helper: upload buffer to Cloudinary ──────────────────────────────────────
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(buffer);
  });
};

// ─── uploadToCloudinary ───────────────────────────────────────────────────────
const uploadToCloudinary = async (filePathOrFile, folder = 'realstate') => {
  // Real Cloudinary
  if (hasCloudinary) {
    // If it's a multer memory-stored file (has .buffer)
    if (typeof filePathOrFile === 'object' && filePathOrFile.buffer) {
      const result = await uploadBufferToCloudinary(filePathOrFile.buffer, {
        folder,
        resource_type: 'auto',
      });
      return { url: result.secure_url, publicId: result.public_id };
    }
    // If it's a file path string (disk storage)
    const result = await cloudinary.uploader.upload(filePathOrFile, {
      folder,
      resource_type: 'auto',
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  // Local fallback
  const filePath = typeof filePathOrFile === 'object' ? filePathOrFile.path : filePathOrFile;
  const filename = path.basename(filePath);
  const subfolder = filePath.includes('properties')
    ? 'properties'
    : filePath.includes('documents')
    ? 'documents'
    : filePath.includes('avatars')
    ? 'avatars'
    : 'properties';

  return {
    url: `/uploads/${subfolder}/${filename}`,
    publicId: filename,
  };
};

// ─── deleteFromCloudinary ─────────────────────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  if (hasCloudinary) {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  }

  // Local fallback
  const subfolders = ['properties', 'documents', 'avatars'];
  for (const sub of subfolders) {
    const filePath = path.join(uploadsRoot, sub, publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return { result: 'ok' };
    }
  }
  return { result: 'not found' };
};

// ─── uploadMultipleToCloudinary ───────────────────────────────────────────────
const uploadMultipleToCloudinary = async (files, folder = 'realstate') => {
  if (hasCloudinary) {
    const results = await Promise.all(
      files.map(async (file) => {
        // Memory storage (Vercel) — file.buffer exists
        if (file.buffer) {
          const result = await uploadBufferToCloudinary(file.buffer, {
            folder,
            resource_type: 'auto',
          });
          return { url: result.secure_url, publicId: result.public_id };
        }
        // Disk storage (local dev) — file.path exists
        const result = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'auto',
        });
        return { url: result.secure_url, publicId: result.public_id };
      })
    );
    return results;
  }

  // Local fallback
  return files.map((file) => ({
    url: `/uploads/properties/${file.filename}`,
    publicId: file.filename,
  }));
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
};
