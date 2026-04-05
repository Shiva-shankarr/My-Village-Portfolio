# Village Portfolio Setup Guide

## Environment Setup

### Server Environment (.env)
1. Create a `.env` file in the `server` directory
2. Copy contents from `.env.example`
3. Fill in your actual values

### Client Environment (.env)
1. Create a `.env` file in the `client` directory
2. Copy contents from `.env.example`
3. Fill in your actual values

## Cloudinary Setup Guide

### Step 1: Create a Cloudinary Account
1. Go to [Cloudinary's website](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your Credentials
1. Log in to your Cloudinary dashboard
2. Find these credentials in your dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Configure Environment Variables
Add these to your `server/.env` file:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Create Upload Preset (Optional)
1. Go to Settings > Upload
2. Create a new upload preset
3. Configure:
   - Signing Mode: Signed
   - Folder: gallery
   - Allowed Formats: image/*

## Admin Account Setup
Default admin credentials:
- Email: shivashankar08@gmail.com
- Password: Shiva_28000@Codee

## Security Notes
1. Never commit `.env` files to version control
2. Keep your Cloudinary credentials secure
3. Regularly rotate your JWT secret
4. Use strong passwords for admin accounts

## Additional Configuration
1. Adjust rate limiting in production
2. Configure CORS for production
3. Set up proper MongoDB indexes
4. Enable Cloudinary image optimization

## Troubleshooting
1. Image upload issues:
   - Check Cloudinary credentials
   - Verify upload preset
   - Check file size limits
2. Authentication issues:
   - Verify JWT secret
   - Check token expiration
   - Validate admin credentials 