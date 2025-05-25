import Course from '../models/course.model.js';
import Section from '../models/section.model.js';
import mongoose from 'mongoose';

// Create a new Course
export const createCourse = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Course name is required' });
  }

  try {
    // Check if course already exists
    const existingCourse = await Course.findOne({ name });
    if (existingCourse) {
      return res.status(409).json({ message: 'Course already exists' });
    }

    // Create and save the new Course
    const newCourse = new Course({ name });
    await newCourse.save();

    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Get all Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get a specific Course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Delete Course only if not used
export const deleteCourse = async (req, res) => {
    try {
      const courseId = req.params.id;
  
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: 'Invalid course ID' });
      }
  
      const sectionsUsingCourse = await Section.find({ course: courseId });
      if (sectionsUsingCourse.length > 0) {
        return res.status(400).json({
          message: 'Course is in use by one or more sections and cannot be deleted.',
        });
      }
  
      const deleted = await Course.findByIdAndDelete(courseId);
      if (!deleted) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
  };