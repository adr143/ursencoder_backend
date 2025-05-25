import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Example: "Computer Science"
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
