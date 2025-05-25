import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';
import TeacherRequest from '../models/teacherRequest.model.js'; 
import {createGradeFormulasForAssignment, deleteGradeFormulasForAssignment} from "./gradeFormula.controller.js"
import { updateSubjectGradesFromFormula } from './studentGrade.controller.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// LOGIN
export const loginTeacher = async (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    console.log(password)
    console.log(teacher.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id }, JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token, teacherId: teacher._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
};

// REGISTER (optional endpoint)
export const registerTeacher = async (req, res) => {
  // console.log(req.body);
  const { name, email, password } = req.body;

  try {
      // Check if email already exists in Teacher or TeacherRequest
      const existingTeacher = await Teacher.findOne({ email });
      const existingRequest = await TeacherRequest.findOne({ email, status: 'pending' });

      if (existingTeacher || existingRequest) {
          return res.status(409).json({ message: 'Email already in use or pending approval' });
      }

      // Hash the password before storing
      // const hashedPassword = await bcrypt.hash(password, 10);

      // Create a pending request
      const request = new TeacherRequest({
          type: 'register',
          name,
          email,
          password
      });

      await request.save();

      // Return the request object so frontend can handle the pending registration
      res.status(201).json({
          message: 'Registration request submitted for approval',
          teacherRequest: request // Send the request object to frontend
      });

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Registration failed' });
  }
};

// GET Teacher Profile
export const getTeacherProfile = async (req, res) => {
  try {
    if (!req.teacher || !req.teacher.id) {
      return res.status(400).json({ message: 'Teacher not authenticated.' });
    }

    const teacher = await Teacher.findById(req.teacher.id)
        .select('-password') // Exclude password
        .populate('assignedSections.section') // Populate section
        .populate('assignedSections.subjects'); // Populate subjects

    if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json(teacher); // Return teacher profile
  } catch (err) {
    console.error('Error fetching teacher profile:', err);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

const flattenAssignments = (assignments) =>
  assignments.flatMap(a => a.subjects.map(s => `${a.section}:${s}`));

// Helper: parse flat keys back to pairs
const parseAssignmentKey = (key) => {
  const [section, subject] = key.split(':');
  return { section, subject };
};

// ASSIGN OR REMOVE SECTIONS AND SUBJECTS TO/FROM TEACHER
export const assignToTeacher = async (req, res) => {
  const { teacherId, assignments } = req.body;

  try {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (!Array.isArray(assignments)) {
      return res.status(400).json({ message: 'Assignments must be an array.' });
    }

    // Flatten old and new assignments
    const oldKeys = flattenAssignments(teacher.assignedSections || []);
    const newKeys = flattenAssignments(assignments);

    // Detect differences
    const added = newKeys.filter(k => !oldKeys.includes(k));
    const removed = oldKeys.filter(k => !newKeys.includes(k));

    // Update teacher's assignments
    teacher.assignedSections = assignments.map(({ section, subjects }) => {
      if (!section || !Array.isArray(subjects)) {
        throw new Error('Each assignment must include a valid section and an array of subjects');
      }
      return { section, subjects };
    });

    await teacher.save();

    // Handle added GradeFormulas
    for (const key of added) {
      const { section, subject } = parseAssignmentKey(key);
      await createGradeFormulasForAssignment(section, subject);

      const terms = ['Prelim', 'Midterm', 'Finalterm'];
      for (const term of terms) {
        await updateSubjectGradesFromFormula(section, subject, term);
      }
    }

    // Handle removed GradeFormulas
    for (const key of removed) {
      const { section, subject } = parseAssignmentKey(key);
      await deleteGradeFormulasForAssignment(section, subject);
    }

    return res.status(200).json({
      message: 'Assignments updated successfully',
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        assignedSections: teacher.assignedSections,
      },
      added,
      removed,
    });

  } catch (err) {
    console.error('Error updating teacher assignments:', err);
    return res.status(500).json({ message: 'Assignment update failed', error: err.message });
  }
};


// GET ALL TEACHERS
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .select('-password') // Exclude password
      .populate('assignedSections.section')
      .populate('assignedSections.subjects');

    res.status(200).json(teachers);
  } catch (err) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the teacher by their ID
    const teacher = await Teacher.findByIdAndDelete(id);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log("", oldPassword, newPassword);
  try {
    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const isMatch = await bcrypt.compare(oldPassword, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    const request = new TeacherRequest({
      type: 'update',
      teacherId: teacher._id,
      name: teacher.name,
      email: teacher.email,
      password: newPassword,
    });

    await request.save();
    res.status(200).json({ message: 'Password change request submitted for approval' });
  } catch (err) {
    console.error('Error submitting password change request:', err);
    res.status(500).json({ message: 'Failed to request password change' });
  }
};

export const changeName = async (req, res) => {
  const { name } = req.body;
  try {
    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const request = new TeacherRequest({
      type: 'update',
      teacherId: teacher._id,
      name,
      email: teacher.email,
      password: teacher.password,
    });

    await request.save();
    res.status(200).json({ message: 'Name change request submitted for approval' });
  } catch (err) {
    console.error('Error submitting name change request:', err);
    res.status(500).json({ message: 'Failed to request name change' });
  }
};

export const changeEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const teacher = await Teacher.findById(req.teacher.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const emailInUse = await Teacher.findOne({ email });
    if (emailInUse && emailInUse._id.toString() !== teacher._id.toString()) {
      return res.status(409).json({ message: 'Email is already in use by another teacher' });
    }

    const request = new TeacherRequest({
      type: 'update',
      teacherId: teacher._id,
      name: teacher.name,
      email,
      password: teacher.password,
    });

    await request.save();
    res.status(200).json({ message: 'Email change request submitted for approval' });
  } catch (err) {
    console.error('Error submitting email change request:', err);
    res.status(500).json({ message: 'Failed to request email change' });
  }
};