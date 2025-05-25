// scripts/addYearLevels.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import YearLevel from './models/yearlevel.model'; // Adjust the path if necessary

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';

const yearLevels = [
  { level: '4CpE' },
  { level: '3CpE' },
  { level: '2CpE' },
  { level: '1CpE' }
];

async function addYearLevels() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const inserted = await YearLevel.insertMany(yearLevels, { ordered: false });
    console.log('✅ YearLevels added:', inserted.map(y => y.level));
  } catch (err) {
    if (err.code === 11000) {
      console.warn('⚠️ Some yearLevels already exist. Skipping duplicates.');
    } else {
      console.error('❌ Error inserting yearLevels:', err);
    }
  } finally {
    await mongoose.disconnect();
  }
}

addYearLevels();
