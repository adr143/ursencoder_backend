import express from 'express';
import {
  createSection,
  getAllSections,
  getSectionById,
  deleteSection
} from '../controllers/section.controller.js';

const router = express.Router();

router.post('/', createSection);              // ➕ Create Section
router.get('/', getAllSections);              // 📥 Fetch all Sections
router.get('/:id', getSectionById);           // 📑 Get Section by ID
router.delete('/:id', deleteSection);

export default router;
