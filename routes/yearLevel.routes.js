import express from 'express';
import { createYearLevel, getAllYearLevels, getYearLevelById, deleteYearLevel, assignSectionsToYearLevel } from '../controllers/yearLevel.controller.js';

const router = express.Router();

// Create a new YearLevel
router.post('/', createYearLevel);

// Get all YearLevels
router.get('/', getAllYearLevels);

// Get YearLevel by ID
router.get('/:id', getYearLevelById);

// Delete YearLevel by ID
router.delete('/:id', deleteYearLevel);

// Assign Sections to an existing YearLevel
router.put('/assign-sections', assignSectionsToYearLevel);

export default router;
