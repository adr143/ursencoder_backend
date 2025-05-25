import mongoose from 'mongoose';

const gradeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g., quiz_1, task_2
  maxPoints: { type: Number, required: true },     // e.g., 20
  score: { type: Number, default: 0 }              // student score
}, { _id: false });

const gradeComponentSchema = new mongoose.Schema({
  componentName: { type: String, required: true },
  items: [gradeItemSchema]
}, { _id: false });

const studentGradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  yearLevel: { type: String, required: true },
  components: [gradeComponentSchema],
  term: { type: String, default: 'Prelim' }
}, { timestamps: true });

export default mongoose.model('StudentGrade', studentGradeSchema);
