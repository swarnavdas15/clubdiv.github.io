import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for admin user seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Create admin user
async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@divclub.com' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      return existingAdmin;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@divclub.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      lastLogin: new Date(),
      loginStreak: 1,
      totalLogins: 1
    });

    await adminUser.save();
    console.log('Admin user created successfully:', {
      id: adminUser._id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      isActive: adminUser.isActive
    });

    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

// Run the script
async function run() {
  await connectDB();
  await createAdminUser();
  await mongoose.connection.close();
  console.log('Database connection closed');
}

run().catch(console.error);
