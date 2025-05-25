import express from 'express';
import {
  initializeStudentGrades,
  updateStudentScore,
  syncStudentGradesWithFormula,
  getStudentGrades,
  upsertStudentGrade,
  getGradesBySectionAndSubject,
  batchUpdateGrades,
  calculateGrade
} from '../controllers/studentGrade.controller.js'; // ✅ fix typo if needed


const router = express.Router();

router.post('/init', initializeStudentGrades);

router.post('/upsert', upsertStudentGrade);

// router.put('/:studentId/update-score', updateStudentScore);

router.put('/sync/:sectionId/:subjectId/:term', syncStudentGradesWithFormula);

// router.get('/:studentId/:sectionId/:subjectId', getStudentGrades);

router.get('/:sectionId/:subjectId', getGradesBySectionAndSubject);

router.put('/:sectionId/:subjectId/batch-update', batchUpdateGrades);

router.get("/calculate-grade/:studentId/:subjectId/:sectionId", calculateGrade);



export default router;
