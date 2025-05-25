import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
// import Admin from './models/admin.model.js'; // Adjust the path if necessary
import dotenv from 'dotenv';
import Teacher from './models/teacher.model.js';

dotenv.config(); // Load environment variables from .env file

// Async function to handle the admin creation
const createTeacher = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Define admin data
    const teacherData = {
      name: 'John', // Replace with desired admin username
      email: 'john@example.com', // Replace with desired admin email
      password: 'johnPassword123', // Replace with desired admin password
    };

    // Create a new Admin instance and save it
    const teacher = new Teacher(teacherData);
    await teacher.save();
    console.log('Teacher created successfully');
  } catch (err) {
    console.error('Error creating teacher:', err);
  } finally {
    // Close the MongoDB connection after the operation
    mongoose.connection.close();
  }
};

// Call the createAdmin function
createTeacher();
