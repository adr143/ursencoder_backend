import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import verifyAdminToken from '../middleware/verifyAdminToken.js';
import multer from 'multer';
const upload = multer(); // No storage needed for just fields

import {
  loginTeacher,
  registerTeacher,
  getTeacherProfile,
  assignToTeacher,
  getAllTeachers,
  deleteTeacher,
  changePassword,
  changeName,
  changeEmail
} from '../controllers/teacher.controller.js';

const router = express.Router();

// Public routes
router.post('/login', loginTeacher);
router.post('/register',upload.none(), registerTeacher);

// Protected routes
router.get('/profile', authenticateToken, getTeacherProfile);
router.get('/', verifyAdminToken, getAllTeachers);
router.delete('/:id', verifyAdminToken, deleteTeacher);
router.post('/assign', verifyAdminToken, upload.none(), assignToTeacher);

router.put('/changePassword', authenticateToken, changePassword);
router.put('/changeName', authenticateToken, changeName);
router.put('/changeEmail', authenticateToken, changeEmail);

export default router;
