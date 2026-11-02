const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const createCloudinaryStorage = require("./cloudinaryStorage");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gallery images
const galleryStorage = createCloudinaryStorage(cloudinary, {
  folder: "kalawati/gallery",
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 1200, crop: "limit", quality: "auto" }],
});

// Website content images
const contentStorage = createCloudinaryStorage(cloudinary, {
  folder: "kalawati/content",
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 1920, crop: "limit", quality: "auto" }],
});

// Payment receipts
const receiptStorage = createCloudinaryStorage(cloudinary, {
  folder: "kalawati/payment-receipts",
  allowedFormats: ["jpg", "jpeg", "png", "webp", "pdf"],
  resourceType: "auto",
});

const uploadGallery = multer({ storage: galleryStorage });
const uploadContent = multer({ storage: contentStorage });
const uploadReceipt = multer({ storage: receiptStorage });

module.exports = {
  cloudinary,
  uploadGallery,
  uploadContent,
  uploadReceipt,
};
