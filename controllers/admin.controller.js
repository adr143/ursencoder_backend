import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model.js';
import Teacher from '../models/teacher.model.js';
import TeacherRequest from '../models/teacherRequest.model.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Admin Login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      adminId: admin._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

// Get all pending teacher requests (teachers awaiting admin approval)
export const getPendingTeacherRequests = async (req, res) => {
  try {
    const requests = await TeacherRequest.find({ status: 'pending' });
    res.status(200).json({ message: 'Pending teacher requests', requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to retrieve teacher requests', error: err });
  }
};

// Approve a teacher's registration or update request
export const approveTeacherRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await TeacherRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    if (request.type === 'register') {
      // Check if teacher with email already exists
      const existingTeacher = await Teacher.findOne({ email: request.email });
      if (existingTeacher) {
        return res.status(409).json({ message: 'Teacher with this email already exists' });
      }

      const newTeacher = new Teacher({
        name: request.name,
        email: request.email,
        password: request.password,
        profilePicture: request.profilePicture,
        status: 'approved'
      });

      await newTeacher.save();

      // Mark request as approved
      request.status = 'approved';
      await request.save();

      return res.status(200).json({ message: 'Teacher approved and created', teacher: newTeacher });
    } else if (request.type === 'update') {
      // Update request requires a valid teacherId
      if (!request.teacherId) {
        return res.status(400).json({ message: 'Teacher ID missing for update request' });
      }

      const teacherToUpdate = await Teacher.findById(request.teacherId);
      if (!teacherToUpdate) {
        return res.status(404).json({ message: 'Teacher to update not found' });
      }

      // Optional: Check if the email is changing and if it conflicts
      if (request.email && request.email !== teacherToUpdate.email) {
        const emailConflict = await Teacher.findOne({ email: request.email });
        if (emailConflict) {
          return res.status(409).json({ message: 'Another teacher with this email already exists' });
        }
        teacherToUpdate.email = request.email;
      }

      // Update other fields if provided
      if (request.name) teacherToUpdate.name = request.name;
      if (request.profilePicture) teacherToUpdate.profilePicture = request.profilePicture;

      // If password is updated, hash it
      if (request.password) {
        teacherToUpdate.password = request.password;
      }

      // Set status if you use it in Teacher model
      teacherToUpdate.status = 'approved';

      await teacherToUpdate.save();

      // Mark request as approved
      request.status = 'approved';
      await request.save();

      return res.status(200).json({ message: 'Teacher updated successfully', teacher: teacherToUpdate });
    } else {
      return res.status(400).json({ message: 'Unknown request type' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Approval failed', error: err.message });
  }
};

// Reject a teacher's registration or update request
export const rejectTeacherRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await TeacherRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ message: 'Pending request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.status(200).json({ message: 'Teacher request rejected', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Rejection failed', error: err });
  }
};
