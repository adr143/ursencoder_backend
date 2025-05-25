import mongoose from 'mongoose';

const gradeItemSchema = new mongoose.Schema({
    name: { type: String, required: true },         // e.g. quiz_1, exam_1
    totalItems: { type: Number, required: true },
    correctItems: { type: Number, required: true }
}, { _id: false });

const gradeComponentSchema = new mongoose.Schema({
    componentName: { type: String, required: true }, // quizzes, exams, behavior, etc.
    scores: [gradeItemSchema]
}, { _id: false });

const termSchema = new mongoose.Schema({
    components: [gradeComponentSchema]
}, { _id: false });

export { gradeItemSchema, gradeComponentSchema, termSchema };