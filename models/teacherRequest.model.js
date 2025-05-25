import mongoose from 'mongoose';

const teacherRequestSchema = new mongoose.Schema({
  type: { type: String, enum: ['register', 'update'], required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, // optional
  name: String,
  email: { type: String, required: true },
  password: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
});

const TeacherRequest = mongoose.model('TeacherRequest', teacherRequestSchema);
export default TeacherRequest;
