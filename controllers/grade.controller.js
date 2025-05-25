import StudentGrade from '../models/studentGrade.model.js';
import GradeFormula from '../models/gradeFormula.model.js';

// Add or update grade entry for a student
export const updateStudentGrade = async (req, res) => {
  const { studentId, subjectId, term, component, itemName, correct, total } = req.body;
  try {
    let grade = await StudentGrade.findOne({ student: studentId, subject: subjectId });
    if (!grade) {
      grade = new StudentGrade({ student: studentId, subject: subjectId });
    }

    grade.terms[term][component][itemName] = { correct, total };
    await grade.save();
    res.status(200).json({ message: 'Grade updated', grade });
  } catch (err) {
    res.status(500).json({ message: 'Error updating grade', error: err });
  }
};

// Set or update grading formula
export const setGradeFormula = async (req, res) => {
  const { sectionId, subjectId, components } = req.body; // components: { project: 15, behavior: 20, etc }
  try {
    const formula = await GradeFormula.findOneAndUpdate(
      { section: sectionId, subject: subjectId },
      { components },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: 'Formula saved', formula });
  } catch (err) {
    res.status(500).json({ message: 'Error saving formula', error: err });
  }
};

// Get a grading formula
export const getGradeFormula = async (req, res) => {
  try {
    const formula = await GradeFormula.findOne({
      section: req.params.sectionId,
      subject: req.params.subjectId
    });
    res.status(200).json({ formula });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching formula', error: err });
  }
};
