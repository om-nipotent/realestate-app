const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Storage Strategy ─────────────────────────────────────────────────────────
// On Vercel the filesystem is read-only, so we use memory storage.
// Locally we keep disk storage for the dev workflow.
const isVercel = !!process.env.VERCEL;

// Ensure uploads directory exists (local only)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!isVercel && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for local dev
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = uploadsDir;

    if (file.fieldname === 'documents') {
      folder = path.join(uploadsDir, 'documents');
    } else if (file.fieldname === 'images') {
      folder = path.join(uploadsDir, 'properties');
    } else if (file.fieldname === 'avatar') {
      folder = path.join(uploadsDir, 'avatars');
    }

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Memory storage for Vercel (files go to Cloudinary from buffer)
const memStorage = multer.memoryStorage();

const storage = isVercel ? memStorage : diskStorage;

// Allowed image MIME types
const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Allowed document MIME types
const documentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (imageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        'Only JPG, JPEG, PNG, and WEBP images are allowed'
      ),
      false
    );
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  if (documentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        'LIMIT_UNEXPECTED_FILE',
        'Only JPG, PNG, and PDF files are allowed for documents'
      ),
      false
    );
  }
};

// File filter for all (images + docs)
const allFileFilter = (req, file, cb) => {
  const allAllowed = [...imageTypes, ...documentTypes];
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'), false);
  }
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024; // 5MB

// Multer instances
const uploadImages = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: imageFileFilter,
}).array('images', 10);

const uploadDocuments = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentFileFilter,
}).array('documents', 5);

const uploadSingle = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: allFileFilter,
}).single('avatar');

// Middleware wrappers to handle multer errors
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Too many files uploaded',
        });
      }
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload error',
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'File upload failed',
      });
    }

    next();
  });
};

// Verification docs storage — also uses memory on Vercel
const vercelVerificationStorage = memStorage;
const localVerificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = path.join(uploadsDir, 'documents');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const uploadVerificationDocsRaw = multer({
  storage: isVercel ? vercelVerificationStorage : localVerificationStorage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: documentFileFilter,
}).fields([
  { name: 'aadharCard', maxCount: 1 },
  { name: 'selfieWithAadhar', maxCount: 1 },
]);

module.exports = {
  uploadImages: handleUpload(uploadImages),
  uploadDocuments: handleUpload(uploadDocuments),
  uploadSingle: handleUpload(uploadSingle),
  uploadVerificationDocs: handleUpload(uploadVerificationDocsRaw),
};
