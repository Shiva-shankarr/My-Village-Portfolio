const config = {
  api: {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000')
  },
  cloudinary: {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'daud0qayvu',
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET,
    folder: process.env.REACT_APP_CLOUDINARY_FOLDER || 'village_portfolio'
  },
  analytics: {
    gaTrackingId: process.env.REACT_APP_GA_TRACKING_ID,
    enableAnalytics: process.env.NODE_ENV === 'production'
  },
  auth: {
    tokenKey: process.env.REACT_APP_TOKEN_KEY || 'village_portfolio_token',
    userKey: process.env.REACT_APP_USER_KEY || 'village_portfolio_user'
  },
  upload: {
    maxFileSize: parseInt(process.env.REACT_APP_MAX_FILE_SIZE || '5242880'), // 5MB
    allowedImageTypes: (process.env.REACT_APP_ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    allowedVideoTypes: (process.env.REACT_APP_ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm').split(','),
    maxImages: parseInt(process.env.REACT_APP_MAX_IMAGES || '5'),
    imageQuality: parseInt(process.env.REACT_APP_IMAGE_QUALITY || '80')
  },
  pagination: {
    defaultLimit: parseInt(process.env.REACT_APP_DEFAULT_LIMIT || '9'),
    maxLimit: parseInt(process.env.REACT_APP_MAX_LIMIT || '50')
  },
  categories: {
    gallery: (process.env.REACT_APP_GALLERY_CATEGORIES || 'nature,youth,festivals,marriages,unity,general').split(','),
    videos: (process.env.REACT_APP_VIDEO_CATEGORIES || 'cultural,educational,development,events,general').split(','),
    updates: (process.env.REACT_APP_UPDATE_CATEGORIES || 'development,education,health,culture,general').split(',')
  },
  ui: {
    theme: {
      primary: process.env.REACT_APP_THEME_PRIMARY || '#4F46E5',
      secondary: process.env.REACT_APP_THEME_SECONDARY || '#10B981',
      accent: process.env.REACT_APP_THEME_ACCENT || '#F59E0B',
      background: process.env.REACT_APP_THEME_BACKGROUND || '#FFFFFF',
      text: process.env.REACT_APP_THEME_TEXT || '#1F2937'
    },
    breakpoints: {
      mobile: parseInt(process.env.REACT_APP_BREAKPOINT_MOBILE || '640'),
      tablet: parseInt(process.env.REACT_APP_BREAKPOINT_TABLET || '1024'),
      desktop: parseInt(process.env.REACT_APP_BREAKPOINT_DESKTOP || '1280')
    }
  },
  app: {
    name: process.env.REACT_APP_NAME || 'Village Portfolio',
    description: process.env.REACT_APP_DESCRIPTION || 'A comprehensive portfolio website for Puriya Thanda village',
    version: process.env.REACT_APP_VERSION || '1.0.0'
  }
};

export default config; 