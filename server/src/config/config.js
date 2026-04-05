const config = {
  port: 5000,
  mongodb: {
    uri: 'mongodb+srv://shivasmart2800:wDLHCIzMz5tAjP2q@cluster0.geisthf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
  },
  jwt: {
    secret: 'village_portfolio_secret_key_2024',
    expiresIn: '30d'
  },
  env: 'development',
  admin: {
    email: 'shivashankar08@gmail.com',
    password: 'admin123',
    name: 'Admin'
  }
};

module.exports = config; 