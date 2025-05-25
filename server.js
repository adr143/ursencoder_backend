import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import studentRoutes from './routes/student.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
// // import gradesRoutes from './routes/grades.routes.js';
import adminRoutes from './routes/admin.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import yearLevelRoutes from './routes/yearLevel.routes.js';
import sectionRoutes from './routes/section.routes.js';
import courseRoutes from './routes/course.routes.js';

import gradeFormualRoutes from './routes/gradeFormula.routes.js';
import studentGradeRoutes from './routes/studentGrade.routes.js';
import cors from 'cors';


dotenv.config();

const app = express();
app.use(cors({
  origin: '*', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Route usage
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/yearLevels', yearLevelRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/courses', courseRoutes);
// app.use('/api/grades', gradesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/formula', gradeFormualRoutes);
app.use('/api/student-grades', studentGradeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
