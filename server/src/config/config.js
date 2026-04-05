const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'replace_with_a_secure_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  },
  env: process.env.NODE_ENV || 'development',
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
    name: process.env.ADMIN_NAME || 'Admin'
  }
};

module.exports = config; 