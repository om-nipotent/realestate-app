/**
 * Local file storage — replaces Cloudinary for local development.
 * Exports the same function signatures so controllers need no changes.
 * Files are saved to: backend/uploads/{properties|documents|avatars}/
 * Served at: /uploads/... via express.static in server.js
 */
const fs = require('fs');
const path = require('path');

const uploadsRoot = path.join(__dirname, '..', 'uploads');

/**
 * "Upload" a file — for local storage the file is already saved by multer.
 * Returns { url, publicId } matching the Cloudinary response shape.
 * @param {string} filePath  - absolute path where multer saved the file
 * @param {string} folder    - subfolder under uploads/ (ignored, multer decides)
 */
const uploadToCloudinary = async (filePath, folder = 'realstate') => {
  // File is already on disk — just build the public URL
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

/**
 * Delete a local file by its publicId (filename).
 * Searches all upload subfolders.
 */
const deleteFromCloudinary = async (publicId) => {
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

/**
 * "Upload" multiple files — already saved by multer, just map to URLs.
 * @param {Array}  files   - multer file objects (with .path and .filename)
 * @param {string} folder  - ignored for local storage
 */
const uploadMultipleToCloudinary = async (files, folder = 'realstate') => {
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
