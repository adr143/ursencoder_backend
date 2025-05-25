import express from 'express';
import verifyAdminToken from '../middleware/verifyAdminToken.js';
import {
  loginAdmin,
  getPendingTeacherRequests,
  approveTeacherRequest,
  rejectTeacherRequest
} from '../controllers/admin.controller.js';

const router = express.Router();

router.post('/login', loginAdmin);

// Admin-only routes
router.get('/teacher-requests', verifyAdminToken, getPendingTeacherRequests);
router.put('/teacher-requests/:id/approve', verifyAdminToken, approveTeacherRequest);
router.put('/teacher-requests/:id/reject', verifyAdminToken, rejectTeacherRequest);

export default router;
