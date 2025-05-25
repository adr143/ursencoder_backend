import express from 'express';
import {
  createGradeFormulasForAssignment,
  getAllTermGradeFormulas,
  submitGradeFormulaChanges
} from '../controllers/gradeFormula.controller.js';

const router = express.Router();

// Create grade formulas for a section and subject (Prelim, Midterm, Final)
router.post('/create', createGradeFormulasForAssignment);

// Get all grade formulas for a section and subject
router.get('/:sectionId/:subjectId', getAllTermGradeFormulas);

router.post('/:section/:subject/:term', submitGradeFormulaChanges);

export default router;
