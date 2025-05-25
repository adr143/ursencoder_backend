import Subject from '../models/subject.model.js';
import Student from '../models/student.model.js';
import mongoose from 'mongoose';


// Create new subject
export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const existing = await Subject.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Subject already exists' });

    const newSubject = new Subject({ name });
    await newSubject.save();

    res.status(201).json(newSubject);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create subject', error: err.message });
  }
};

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({}, '_id name');
    res.status(200).json(subjects);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid subject ID' });
    }

    const deleted = await Subject.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await Student.updateMany(
      { subjects: id },
      { $pull: { subjects: id } }
    );

    res.status(200).json({ message: 'Subject deleted', deleted });
  } catch (err) {
    console.error('Delete subject error:', err);
    res.status(500).json({ message: 'Failed to delete subject', error: err.message });
  }
};