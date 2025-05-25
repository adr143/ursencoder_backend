import GradeFormula from '../models/gradeFormula.model.js';
import Section from '../models/section.model.js';
import mongoose from 'mongoose';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createGradeFormulasForAssignment = async (sectionId, subjectId) => {

  try {
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const terms = ['Prelim', 'Midterm', 'Finalterm'];
    const createdFormulas = [];

    for (const term of terms) {
      // Check if it already exists
      const exists = await GradeFormula.findOne({
        section: sectionId,
        subject: subjectId,
        term,
      });

      if (!exists) {
        const formula = new GradeFormula({
          yearLevel: section.yearLevel,
          section: sectionId,
          subject: subjectId,
          term,
          components: [
            {
              componentName: 'quizzes',
              weight: 30,
              items: [
                { name: 'quiz_1', maxPoints: 10 },
                { name: 'quiz_2', maxPoints: 10 }
              ]
            },
            {
              componentName: 'exams',
              weight: 40,
              items: [
                { name: 'exam', maxPoints: 50 }
              ]
            },
            {
              componentName: 'activities',
              weight: 30,
              items: [
                { name: 'activity_1', maxPoints: 20 },
                { name: 'activity_2', maxPoints: 20 }
              ]
            }
          ]
        });

        await formula.save();
        createdFormulas.push(formula);
      }
    }

    res.status(201).json({
      message: 'Grade formulas created successfully',
      created: createdFormulas.length,
      formulas: createdFormulas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating grade formulas' });
  }
};

export const getAllTermGradeFormulas = async (req, res) => {
  const { sectionId, subjectId } = req.params;

  try {
    const formulas = await GradeFormula.find({
      section: sectionId,
      subject: subjectId
    });

    if (formulas.length === 0) {
      return res.status(404).json({ message: 'No grade formulas found for this section and subject' });
    }

    res.status(200).json(formulas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving grade formulas' });
  }
};

export const deleteGradeFormulasForAssignment = async (req, res) => {
  const { sectionId, subjectId } = req.params;

  try {
    // Validate section and subject IDs
    if (!isValidId(sectionId) || !isValidId(subjectId)) {
      return res.status(400).json({ message: 'Invalid section or subject ID' });
    }

    // Check if section exists
    const section = await findAndValidateSection(sectionId);

    // Delete grade formulas for the given section, subject, and all terms
    const deletedFormulas = await GradeFormula.deleteMany({
      section: sectionId,
      subject: subjectId
    });

    // If no formulas were deleted, send a response indicating nothing was found
    if (deletedFormulas.deletedCount === 0) {
      return res.status(404).json({ message: 'No grade formulas found for the provided section and subject' });
    }

    // Send success response
    res.status(200).json({ message: 'Grade formulas deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting grade formulas' });
  }
};

export const findGradeFormula = async (sectionId, subjectId, term) => {
  return await GradeFormula.findOne({ section: sectionId, subject: subjectId, term });
};

export const submitGradeFormulaChanges = async (req, res) => {
  const { section, subject, term } = req.params;
  const { changes } = req.body;
  console.log(req.body)

  console.log("=== Incoming Grade Formula Update Request ===");
  console.log("Section ID:", section);
  console.log("Subject ID:", subject);
  console.log("Term:", term);
  console.log("Changes:", JSON.stringify(changes, null, 2));

  // Validate input
  if (!section || !subject || !term || !Array.isArray(changes)) {
    console.log("Missing required fields: section, subject, term, or changes[]")
    return res.status(400).json({ message: 'Missing required fields: section, subject, term, or changes[]' });
  }

  if (!isValidId(section) || !isValidId(subject)) {
    console.log('Invalid section or subject ID')
    return res.status(400).json({ message: 'Invalid section or subject ID' });
  }

  try {
    const gradeFormula = await findGradeFormula(section, subject, term);
    if (!gradeFormula) {
      console.log("Grade formula not found for:", section, subject, term);
      return res.status(404).json({ message: 'Grade formula not found' });
    }

    for (const change of changes) {
      const {
        action,
        componentName,
        itemName,
        newWeight,
        newItem,
        newMaxPoints,
      } = change;

      console.log(`Processing action: ${action}, Component: ${componentName}`);

      let component;

      if (action !== 'addComponent') {
        component = gradeFormula.components.find(
          (comp) => comp.componentName === componentName
        );
        if (!component && action !== 'removeComponent') {
          return res.status(404).json({ message: `Component '${componentName}' not found` });
        }
      }

      switch (action) {
        case 'editWeight':
          component.weight = newWeight;
          break;

        case 'addItem':
          if (!newItem || !newItem.name || newItem.maxPoints == null) {
            return res.status(400).json({ message: 'Invalid newItem for addItem' });
          }
          component.items.push({ name: newItem.name, maxPoints: newItem.maxPoints });
          break;

        case 'removeItem':
          component.items = component.items.filter((item) => item.name !== itemName);
          break;

        case 'editItemMaxPoints':
          const item = component.items.find((item) => item.name === itemName);
          if (item) {
            item.maxPoints = newMaxPoints;
          } else {
            return res.status(404).json({ message: `Item '${itemName}' not found in component '${componentName}'` });
          }
          break;

        case 'addComponent':
          if (!componentName) {
            return res.status(400).json({ message: 'Missing componentName for addComponent' });
          }
          gradeFormula.components.push({
            componentName,
            weight: newWeight || 0,
            items: newItem ? [newItem] : [],
          });
          break;

        case 'removeComponent':
          gradeFormula.components = gradeFormula.components.filter(
            (comp) => comp.componentName !== componentName
          );
          break;

        default:
          return res.status(400).json({ message: `Invalid action '${action}'` });
      }
    }

    await gradeFormula.save();
    res.status(200).json({ message: 'Grade formula updated successfully' });

  } catch (err) {
    console.error("Error updating grade formula:", err);
    res.status(500).json({ message: 'Server error while updating grade formula' });
  }
};