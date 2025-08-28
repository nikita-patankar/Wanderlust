const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Multer storage config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Wanderlust_DEV',
    },
});

// Optional: file type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .jpg, .jpeg, .png formats allowed!"), false);
    }
};

// Multer upload middleware
const upload = multer({ storage, fileFilter });

// ✅ Export everything correctly
module.exports = {
    cloudinary,
    storage,
    upload
};
