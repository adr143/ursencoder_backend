import Section from '../models/section.model.js';
import Course from '../models/course.model.js';
import YearLevel from '../models/yearlevel.model.js';

// Create a new Section and assign a Course and YearLevel
export const createSection = async (req, res) => {
  const { name, course, yearLevel } = req.body;

  if (!name || !course || !yearLevel) {
    return res.status(400).json({ message: 'Name, Course, and YearLevel are required' });
  }

  try {
    // Validate Course and YearLevel
    const foundCourse = await Course.findById(course);
    if (!foundCourse) {
      return res.status(400).json({ message: 'Course not found' });
    }

    const foundYearLevel = await YearLevel.findById(yearLevel);
    if (!foundYearLevel) {
      return res.status(400).json({ message: 'YearLevel not found' });
    }

    // Create and save the new Section
    const newSection = new Section({
      name,
      course,
      yearLevel,
    });

    await newSection.save();

    // Add the section to the YearLevel's sections array
    foundYearLevel.sections.push(newSection._id);
    await foundYearLevel.save();

    res.status(201).json({ message: 'Section created successfully', section: newSection });
  } catch (error) {
    res.status(500).json({ message: 'Error creating section', error: error.message });
  }
};

// Get all Sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await Section.find().populate('course yearLevel');
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error: error.message });
  }
};

// Get a specific Section by ID
export const getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate('course yearLevel');
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching section', error: error.message });
  }
};

// Delete Section and remove reference from YearLevel
export const deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Only pull if section.yearLevel is valid
    if (section.yearLevel) {
      await YearLevel.findByIdAndUpdate(section.yearLevel.toString(), {
        $pull: { sections: section._id },
      });
    }

    await Section.findByIdAndDelete(section._id);

    res.status(200).json({ message: 'Section deleted' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ message: 'Error deleting section', error: error.message });
  }
};

