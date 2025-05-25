// scripts/clearYearLevels.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import YearLevel from './models/yearlevel.model.js'; // Adjust the path if necessary

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';

async function clearYearLevels() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const deleted = await YearLevel.deleteMany({});
    console.log(`✅ ${deleted.deletedCount} YearLevel(s) removed.`);
  } catch (err) {
    console.error('❌ Error deleting YearLevels:', err);
  } finally {
    await mongoose.disconnect();
  }
}

clearYearLevels();
