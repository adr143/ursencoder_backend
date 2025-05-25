import Student from '../models/student.model.js';
import StudentGrade from '../models/studentGrade.model.js';
import { createSubjectGradesForStudent, deleteSubjectGradesForStudent } from './studentGrade.controller.js';

// Create a new student
export const createStudent = async (req, res) => {
  try {
    const { name, studentId, course, section, yearLevel, subjects } = req.body;
    console.log(req.body)

    if (!name || !studentId || !course || !section || !yearLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newStudent = new Student(req.body);
    await newStudent.save();

    if (subjects) {
      createSubjectGradesForStudent(newStudent._id.toString(), subjects, section, yearLevel);
    }

    res.status(201).json({ message: 'Student created', student: newStudent });
  } catch (err) {
    res.status(500).json({ message: 'Error creating student', error: err });
  }
};

// Get a student's info and grades
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('section')  // Populate section
      .populate('subjects') // Populate subjects
      .populate('course')   // Populate course
      .populate('yearLevel'); // Populate yearLevel (added)

    const grades = await StudentGrade.find({ student: student._id });
    res.status(200).json({ student, grades });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student', error: err });
  }
};

// Edit student info
export const updateStudent = async (req, res) => {
  try {
    const { name, studentId, course, section, subjects, yearLevel } = req.body;

    // Validate subjects is an array if provided
    if (subjects && !Array.isArray(subjects)) {
      return res.status(400).json({ message: 'Subjects must be an array of IDs' });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldSubjects = student.subjects.map(id => id.toString());  // Convert ObjectIds to strings
    const newSubjects = subjects.map(id => id.toString());

    // Find removed and added subjects
    const removedSubjects = oldSubjects.filter(id => !newSubjects.includes(id));
    const addedSubjects = newSubjects.filter(id => !oldSubjects.includes(id));

    // Update student data
    student.name = name;
    student.studentId = studentId;
    student.course = course;
    student.section = section;
    student.yearLevel = yearLevel;
    student.subjects = subjects;

    await student.save();

    // Handle subject grade creation/deletion
    if (removedSubjects.length > 0) {
      await deleteSubjectGradesForStudent(student._id, removedSubjects, section);
    }

    if (addedSubjects.length > 0) {
      await createSubjectGradesForStudent(student._id, addedSubjects, section, yearLevel);
    }

    res.status(200).json({ message: 'Student updated', student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating student', error: err });
  }
};

// Get all students with pagination and optional search query
export const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      searchQuery = '',
      screenSize = 'medium',
      yearLevelId,
      sectionId,
      subjectId
    } = req.query;

    // Convert to numbers
    let pageNumber = parseInt(page, 10);
    let limit = parseInt(pageSize, 10);

    // Adjust limit based on screenSize
    if (isNaN(limit) || limit <= 0) {
      if (screenSize === 'small') limit = 5;
      else if (screenSize === 'large') limit = 15;
      else limit = 10; // default for medium
    }

    const skip = (pageNumber - 1) * limit;

    // Base query
    const query = {};

    if (searchQuery) {
      query.name = { $regex: new RegExp(searchQuery, 'i') };
    }

    if (yearLevelId) {
      query.yearLevel = yearLevelId;
    }

    if (sectionId) {
      query.section = sectionId;
    }

    if (subjectId) {
      query.subjects = subjectId; // assumes `subjects` is an array of ObjectIds
    }

    const students = await Student.find(query)
      .skip(skip)
      .limit(limit)
      .populate('section', 'name')
      .populate('subjects', 'name')
      .populate('course', 'name')
      .populate('yearLevel', 'level');

    const totalCount = await Student.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      students,
      totalPages,
      currentPage: pageNumber,
      totalCount,
      pageSize: limit
    });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: 'Error fetching students', error: err });
  }
};

// Add subjects to a student
export const addSubjectsToStudent = async (req, res) => {
  try {
    const { subjectIds } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { subjects: { $each: subjectIds } } },
      { new: true }
    );
    res.status(200).json({ message: 'Subjects added', student });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add subjects', error: err });
  }
};

// Delete a student by ID
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Optional: Remove related student grades
    await StudentGrade.deleteMany({ student: req.params.id });

    res.status(200).json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting student', error: err });
  }
};
