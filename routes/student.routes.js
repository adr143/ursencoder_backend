import express from 'express';
import {
  createStudent,
  getStudentById,
  updateStudent,
  getAllStudents,
  addSubjectsToStudent,
  deleteStudent
} from '../controllers/student.controller.js';

const router = express.Router();

router.post('/', createStudent);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.get('/', getAllStudents);
router.delete('/:id', deleteStudent); 
router.put('/:id/add-subjects', addSubjectsToStudent);

export default router;
