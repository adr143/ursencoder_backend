// scripts/deleteStudents.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/student.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';

async function deleteAllStudents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await Student.deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} students`);
  } catch (err) {
    console.error('❌ Error deleting students:', err);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAllStudents();
