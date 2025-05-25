import mongoose from 'mongoose';

// Schema for individual items like quiz_1, activity_1, etc.
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },    // e.g., quiz_1, activity_1
  maxPoints: { type: Number, required: true } // Max points for this item
});

// Schema for grade components (like quizzes, activities, exams)
const gradeComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true }, // e.g., quizzes, activities, exams
  weight: { type: Number, required: true },        // Weight of this component (e.g., 30% for quizzes)
  items: [itemSchema]                              // Individual items (e.g., quiz_1, activity_1)
});

const gradeFormulaSchema = new mongoose.Schema({
  yearLevel: { type: String, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  term: { type: String, enum: ['Prelim', 'Midterm', 'Finalterm'], required: true },  // ← Add this
  components: [gradeComponentSchema]
});


export default mongoose.model('GradeFormula', gradeFormulaSchema);
