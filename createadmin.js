import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/admin.model.js'; // Adjust the path if necessary
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Async function to handle the admin creation
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Define admin data
    const adminData = {
      username: 'adminUser', // Replace with desired admin username
      email: 'admin@example.com', // Replace with desired admin email
      password: 'adminPassword123', // Replace with desired admin password
    };

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create a new Admin instance and save it
    const admin = new Admin(adminData);
    await admin.save();
    console.log('Admin created successfully');
  } catch (err) {
    console.error('Error creating admin:', err);
  } finally {
    // Close the MongoDB connection after the operation
    mongoose.connection.close();
  }
};

// Call the createAdmin function
createAdmin();
