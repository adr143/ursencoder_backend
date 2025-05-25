// scripts/addStudents.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/student.model.js';
import Section from './models/section.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db_name';

// List of 40 sample student names
const sampleNames = [
  'Alice Reyes', 'Ben Cruz', 'Carla Santos', 'Daniel Gomez', 'Ella Navarro',
  'Francis Martinez', 'Gina Tan', 'Hugo Mendoza', 'Ivy Smith', 'Jackie Ocampo',
  'Kyle Morales', 'Lara Dela Cruz', 'Mark Flores', 'Nancy Ramos', 'Oscar Ruiz',
  'Paola Santos', 'Quinn Torres', 'Rafael Delgado', 'Sophia Gamboa', 'Tommy Santos',
  'Ursula Cordero', 'Victor Perez', 'Wendy Garcia', 'Xander Morales', 'Yasmin Tan',
  'Zoe Alvarez', 'Anna Torres', 'Brian Lim', 'Carmen Li', 'David De Leon',
  'Elena Vargas', 'Felix Rodriguez', 'Grace Lopez', 'Holly Perez', 'Ian Santos',
  'Julia Reyes', 'Kevin Wong', 'Liam Chavez', 'Maya Gonzalez', 'Noah Garcia'
];

async function addStudents() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Fetch all sections
    const sections = await Section.find({});
    if (sections.length === 0) throw new Error('No sections found');

    const studentsToAdd = [];

    // Loop over the sample names and assign to sections
    sampleNames.forEach((name, index) => {
      const section = sections[index % sections.length]; // Distribute students across sections
      studentsToAdd.push({
        name,
        studentId: `S${1001 + index}`, // Student IDs S1001, S1002, etc.
        section: section._id,         // Section assigned
        subjects: []                  // No subjects assigned for now
      });
    });

    // Insert students into the database
    await Student.insertMany(studentsToAdd);
    console.log('✅ 40 students added successfully!');
  } catch (err) {
    console.error('❌ Error inserting students:', err);
  } finally {
    await mongoose.disconnect();
  }
}

addStudents();
