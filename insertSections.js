// scripts/addSectionsForAllYearLevels.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import YearLevel from './models/yearlevel.model.js'; // Adjust paths as needed
import Section from './models/section.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';

const sectionSuffixes = ['A', 'B', 'C'];

async function addSections() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const yearLevels = await YearLevel.find({});
    if (!yearLevels.length) throw new Error('No year levels found');

    const sectionsToAdd = [];

    for (const year of yearLevels) {
      for (const suffix of sectionSuffixes) {
        sectionsToAdd.push({
          name: `${year.level} - ${suffix}`,
          yearLevel: year._id,
          subjects: [],
        });
      }
    }

    await Section.insertMany(sectionsToAdd);
    console.log(`✅ Added ${sectionsToAdd.length} sections (A, B, C for each year level).`);
  } catch (err) {
    console.error('❌ Error adding sections:', err);
  } finally {
    await mongoose.disconnect();
  }
}

addSections();
