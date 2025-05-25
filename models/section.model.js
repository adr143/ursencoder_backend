import mongoose from 'mongoose';
import Course from './course.model.js'; // Import the Course model

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Example: "Section A"
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }, // Reference to Course model
  yearLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'YearLevel', required: true }, // Reference to YearLevel model
});

const Section = mongoose.model('Section', sectionSchema);
export default Section;
