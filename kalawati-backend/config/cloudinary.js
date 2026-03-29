const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kalawati/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
  },
});

// Storage for content images (hero, etc.)
const contentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "kalawati/content",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1920, crop: "limit", quality: "auto" }],
  },
});

const uploadGallery  = multer({ storage: galleryStorage });
const uploadContent  = multer({ storage: contentStorage });

module.exports = { cloudinary, uploadGallery, uploadContent };
