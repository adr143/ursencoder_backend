import StudentGrade from '../models/studentGrade.model.js';
import GradeFormula from '../models/gradeFormula.model.js';
import Student from '../models/student.model.js';
import mongoose from 'mongoose';

// Helper: Generate grade components from GradeFormula
const generateComponentsFromFormula = (formula) => {
  return formula.components.map((component) => ({
    componentName: component.componentName,
    items: component.items.map(item => ({
      name: item.name,
      maxPoints: item.maxPoints,
      score: 0,
    }))
  }));
};

// CREATE subjectGrades for a student when subjects are assigned
export const createSubjectGradesForStudent = async (studentId, subjectIds, sectionId, yearLevel) => {
  const terms = ['Prelim', 'Midterm', 'Finalterm'];

  for (const subjectId of subjectIds) {
    for (const term of terms) {
      const formula = await GradeFormula.findOne({ subject: subjectId, section: sectionId, term });

      const components = formula ? generateComponentsFromFormula(formula) : [];

      const existing = await StudentGrade.findOne({ student: studentId, subject: subjectId, section: sectionId, term });
      if (!existing) {
        const grade = new StudentGrade({
          student: studentId,
          subject: subjectId,
          section: sectionId,
          yearLevel,
          components,
          term
        });
        await grade.save();
      }
    }
  }
};

// DELETE subjectGrades when subject is removed from student
export const deleteSubjectGradesForStudent = async (studentId, removedSubjectIds, sectionId) => {
  await StudentGrade.deleteMany({
    student: studentId,
    subject: { $in: removedSubjectIds },
    section: sectionId
  });
};

// UPDATE subjectGrades when GradeFormula is updated
export const updateSubjectGradesFromFormula = async (sectionId, subjectId, term) => {
  const formula = await GradeFormula.findOne({ section: sectionId, subject: subjectId, term });
  if (!formula) return;

  const grades = await StudentGrade.find({ section: sectionId, subject: subjectId, term });

  const newComponents = generateComponentsFromFormula(formula);

  for (const grade of grades) {
    grade.components = newComponents;
    await grade.save();
  }
};

// GET all grades for a student (optional route)
export const getGradesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const grades = await StudentGrade.find({ student: studentId })
      .populate('subject')
      .populate('section');
    res.status(200).json(grades);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get grades', error: err });
  }
};

// DELETE all grades for a student (if student is deleted)
export const deleteAllGradesForStudent = async (studentId) => {
  await StudentGrade.deleteMany({ student: studentId });
};

export const getStudentGrades = async (req, res) => {
  const { studentId, sectionId, subjectId } = req.params;

  try {
    const grades = await StudentGrade.find({
      student: studentId,
      section: sectionId,
      subject: subjectId
    }).populate('subject').populate('section');

    if (!grades || grades.length === 0) {
      return res.status(404).json({ message: 'Grades not found' });
    }

    res.status(200).json(grades);
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ message: 'Failed to fetch grades', error: err });
  }
};

export const getGradesBySectionAndSubject = async (req, res) => {
  try {
    const { sectionId, subjectId } = req.params;

    // Fetch grades for the given section and subject
    const grades = await StudentGrade.find({ section: sectionId, subject: subjectId })
      .populate('student')   // Populate student details
      .populate('subject')   // Populate subject details
      .populate('section');  // Populate section details

    const studentMap = new Map();

    grades.forEach((grade) => {
      const studentId = grade.student._id.toString();

      // If student is not in the map, initialize it
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          student: grade.student,
          terms: {}
        });
      }

      const studentEntry = studentMap.get(studentId);

      // Determine the term for grouping (default to "Unknown" if not provided)
      const term = grade.term || "Unknown";
      if (!studentEntry.terms[term]) {
        studentEntry.terms[term] = [];
      }

      // Group components by term
      grade.components.forEach((component) => {
        studentEntry.terms[term].push({
          componentName: component.componentName,
          items: component.items
        });
      });
    });

    // Convert the map to an array of student data
    const groupedGrades = Array.from(studentMap.values());

    // Send the grouped data as response
    res.status(200).json(groupedGrades);
  } catch (err) {
    console.error("Error in getGradesBySectionAndSubject:", err);
    res.status(500).json({ message: 'Failed to get grades', error: err.message });
  }
};

export const batchUpdateGrades = async (req, res) => {
  try {
    const { updatedGrades } = req.body;
    const { sectionId, subjectId } = req.params;

    for (const gradeData of updatedGrades) {
      const { studentId, terms } = gradeData;

      // Loop over each term to update its respective StudentGrade document
      for (const termName of Object.keys(terms)) {
        const components = terms[termName];

        const grade = await StudentGrade.findOne({
          student: studentId,
          section: sectionId,
          subject: subjectId,
          term: termName
        });

        if (grade) {
          grade.components = components;
          await grade.save();
        } else {
          // Optional: create a new grade record if it doesn't exist
          await StudentGrade.create({
            student: studentId,
            section: sectionId,
            subject: subjectId,
            term: termName,
            components
          });
        }
      }
    }

    res.status(200).json({ message: 'Grades updated successfully' });
  } catch (err) {
    console.error('Error batch updating grades:', err);
    res.status(500).json({ message: 'Failed to update grades', error: err.message });
  }
};

// Add this to your controller if needed
export const initializeStudentGrades = async (req, res) => {
  const { studentId, sectionId, subjectIds, yearLevel } = req.body;

  try {
    await createSubjectGradesForStudent(studentId, subjectIds, sectionId, yearLevel);
    res.status(200).json({ message: "Grades initialized" });
  } catch (err) {
    console.error("Error initializing grades:", err);
    res.status(500).json({ message: "Failed to initialize grades", error: err });
  }
};

export const upsertStudentGrade = async (req, res) => {
  const { studentId, subjectId, sectionId, term, yearLevel, components } = req.body;

  try {
    let grade = await StudentGrade.findOne({ student: studentId, subject: subjectId, section: sectionId, term });

    if (grade) {
      // Update components
      grade.components = components;
    } else {
      // Create new grade
      grade = new StudentGrade({
        student: studentId,
        subject: subjectId,
        section: sectionId,
        yearLevel,
        term,
        components
      });
    }

    await grade.save();
    res.status(200).json({ message: 'Grade upserted successfully', grade });
  } catch (err) {
    console.error("Upsert error:", err);
    res.status(500).json({ message: "Failed to upsert grade", error: err });
  }
};

export const updateStudentScore = async (req, res) => {
  const { studentId } = req.params;
  const { subjectId, sectionId, term, componentName, itemName, newScore } = req.body;

  try {
    const grade = await StudentGrade.findOne({ student: studentId, subject: subjectId, section: sectionId, term });

    if (!grade) {
      return res.status(404).json({ message: 'Grade record not found' });
    }

    const component = grade.components.find(c => c.componentName === componentName);
    if (!component) {
      return res.status(404).json({ message: 'Component not found' });
    }

    const item = component.items.find(i => i.name === itemName);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.score = newScore;
    await grade.save();

    res.status(200).json({ message: 'Score updated successfully', grade });
  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).json({ message: "Failed to update score", error: err });
  }
};

export const syncStudentGradesWithFormula = async (req, res) => {
  const { sectionId, subjectId, term } = req.params;

  try {
    const formula = await GradeFormula.findOne({ section: sectionId, subject: subjectId, term });

    if (!formula) {
      return res.status(404).json({ message: 'Grade formula not found' });
    }

    const newComponents = generateComponentsFromFormula(formula); // generates [{ componentName, items: [{ name, maxPoints }] }]

    const grades = await StudentGrade.find({ section: sectionId, subject: subjectId, term });

    for (const grade of grades) {
      const mergedComponents = [];

      for (const newComp of newComponents) {
        const existingComp = grade.components.find(c => c.componentName === newComp.componentName);

        const mergedItems = newComp.items.map(newItem => {
          const existingItem = existingComp?.items.find(i => i.name === newItem.name);
          return {
            name: newItem.name,
            maxPoints: newItem.maxPoints,
            score: existingItem?.score ?? 0, // retain score if it exists, otherwise 0
          };
        });

        mergedComponents.push({
          componentName: newComp.componentName,
          items: mergedItems,
        });
      }

      grade.components = mergedComponents;
      await grade.save();
    }

    res.status(200).json({ message: 'Grades synced with updated formula and scores retained' });
  } catch (err) {
    console.error("Error syncing grades:", err);
    res.status(500).json({ message: "Failed to sync grades", error: err });
  }
};

export const calculateGrade = async (req, res) => {
  try {
    const { studentId, subjectId, sectionId } = req.params;

    const terms = ["Prelim", "Midterm", "Final"];
    const termGrades = {};
    let overallTotal = 0;

    for (const term of terms) {
      // Get formula for the term
      const formula = await GradeFormula.findOne({
        subject: subjectId,
        section: sectionId,
        term,
      });

      if (!formula) {
        termGrades[term] = 0;
        continue;
      }

      // Get student grade data
      const studentGrade = await StudentGrade.findOne({
        student: studentId,
        subject: subjectId,
        section: sectionId,
        term,
      });

      if (!studentGrade) {
        termGrades[term] = 0;
        continue;
      }

      let termTotal = 0;

      for (const component of formula.components) {
        const weight = component.percentage / 100;
        const studentComponent = studentGrade.components.find(c => c.componentName === component.componentName);

        if (!studentComponent || !studentComponent.items || studentComponent.items.length === 0) continue;

        let scoreSum = 0;
        let maxSum = 0;

        for (const item of studentComponent.items) {
          scoreSum += item.score || 0;
          maxSum += item.maxPoints || 0;
        }

        if (maxSum === 0) continue;

        const componentPercentage = scoreSum / maxSum; // e.g., 0.75 for 75%
        termTotal += componentPercentage * weight * 100; // Convert to percentage
      }

      termGrades[term] = parseFloat(termTotal.toFixed(2));
      overallTotal += termGrades[term];
    }

    const totalGrade = parseFloat((overallTotal / terms.length).toFixed(2));

    res.json({
      studentId,
      subjectId,
      sectionId,
      termGrades,
      totalGrade
    });

  } catch (error) {
    console.error("Grade calculation error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};