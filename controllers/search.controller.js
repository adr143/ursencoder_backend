import Student from '../models/student.model.js';
import Teacher from '../models/teacher.model.js';
import Section from '../models/section.model.js';
import Subject from '../models/subject.model.js';

export const getStudentsByTeacherAndSection = async (req, res) => {
  const { teacherId, sectionId, year } = req.params;

  try {
    // Fetch the teacher's assigned sections and subjects
    const teacher = await Teacher.findById(teacherId)
      .populate('assignedSections.section') // Populate section details
      .populate('assignedSections.subjects'); // Populate subjects details

    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Find the section that matches the year and sectionId
    const section = teacher.assignedSections.find(
      (assigned) => assigned.section._id.toString() === sectionId && assigned.section.year === year
    );

    if (!section) {
      return res.status(404).json({ message: 'Section not found for this teacher' });
    }

    // Get the list of subject IDs the teacher is assigned to for this section
    const subjectIds = section.subjects.map((subject) => subject._id);

    // Fetch all students in the specific section who are enrolled in the subjects
    const students = await Student.find({
      section: sectionId,
      subjects: { $in: subjectIds }, // Match if any of the student's subjects is in the teacher's subjects
    });

    res.status(200).json({ message: 'Students fetched successfully', students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching students' });
  }
};
