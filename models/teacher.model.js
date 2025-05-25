import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  assignedSections: [{
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }]
  }],
  // This will hold the teacher's role (admin, etc.) or other extra info if needed in the future
  role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
});

// Hash password before saving
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
