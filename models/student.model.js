import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  yearLevel: { type: mongoose.Schema.Types.ObjectId, ref: 'YearLevel', required: true }, // Added yearLevel field
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
});

export default mongoose.model('Student', studentSchema);
