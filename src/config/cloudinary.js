const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Validate Cloudinary config early
const validateCloudinaryConfig = () => {
  const required = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:', missing.join(', '));
    throw new Error(`Cloudinary configuration missing: ${missing.join(', ')}`);
  }
  
  console.log('✅ Cloudinary config validated - Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
};

validateCloudinaryConfig();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// FIXED: Use memory storage first, then upload to Cloudinary manually
const memoryStorage = multer.memoryStorage();

const upload = multer({ 
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Manual upload function to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'masters-academy',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    console.log('🗑️ Deleting image from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Helper function to extract public ID from Cloudinary URL
const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    console.log('🔍 Extracted public ID:', publicId, 'from URL:', url);
    return publicId;
  } catch (error) {
    console.error('❌ Error extracting public ID from URL:', url, error);
    throw new Error('Invalid Cloudinary URL format');
  }
};

// Test Cloudinary connection on startup
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection test successful');
  })
  .catch(error => {
    console.error('❌ Cloudinary connection test failed:', error.message);
  });

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  deleteImage,
  extractPublicId
};