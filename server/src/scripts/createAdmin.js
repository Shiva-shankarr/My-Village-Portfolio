const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || config.mongodb.uri);

    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'Admin';

    if (!adminEmail || !adminPassword) {
      console.error('Admin email and password must be provided in environment variables');
      process.exit(1);
    }

    // Upsert admin user so running this script always enforces env credentials.
    const adminExists = await User.findOne({ email: adminEmail }).select('+password');

    if (adminExists) {
      adminExists.name = adminName;
      adminExists.password = adminPassword;
      adminExists.role = 'admin';
      await adminExists.save();
      console.log('Admin user updated successfully:', adminExists.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully:', admin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin(); 