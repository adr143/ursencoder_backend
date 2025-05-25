import express from 'express';
import {
  createSubject,
  getAllSubjects,
  deleteSubject,
} from '../controllers/subject.controller.js';

const router = express.Router();

router.post('/', createSubject);           // ➕ Add new subject
router.get('/', getAllSubjects);           // 📥 Fetch all subjects
router.delete('/:id', deleteSubject);      // ❌ Delete a subject

export default router;
