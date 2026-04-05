const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'daud0qayvu',
  api_key: process.env.CLOUDINARY_API_KEY || '383397915441385',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Ow4GUhbAXzieDKtvOmiK61EgkbU'
});

module.exports = cloudinary; 