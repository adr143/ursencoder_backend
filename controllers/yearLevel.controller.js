import YearLevel from '../models/yearlevel.model.js';
import Section from '../models/section.model.js'; // Import Section model

// Create a new YearLevel and assign Sections
export const createYearLevel = async (req, res) => {
  const { name } = req.body;
  console.log("Payload received:", req.body);

  if (!name) {
    return res.status(400).json({ message: 'Level is required' });
  }

  try {
    const exists = await YearLevel.findOne({ name });
    if (exists) {
      console.log("Duplicate name:", name);
      return res.status(400).json({ message: 'Year level already exists' });
    }

    const newYearLevel = new YearLevel({
      name,
      sections: [],
    });

    const saved = await newYearLevel.save();
    console.log("Saved:", saved);

    res.status(201).json({ message: 'YearLevel created successfully', yearLevel: saved });
  } catch (error) {
    console.error("Error saving YearLevel:", error);
    res.status(500).json({ message: 'Error creating YearLevel', error: error.message });
  }
};



// Get all YearLevels with populated sections
export const getAllYearLevels = async (req, res) => {
  try {
    const yearLevels = await YearLevel.find().populate('sections'); // Populate sections
    res.status(200).json(yearLevels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching YearLevels', error: error.message });
  }
};

// Get a specific YearLevel by ID
export const getYearLevelById = async (req, res) => {
  try {
    const yearLevel = await YearLevel.findById(req.params.id).populate('sections');

    if (!yearLevel) {
      return res.status(404).json({ message: 'YearLevel not found' });
    }

    res.status(200).json(yearLevel);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching YearLevel', error: error.message });
  }
};


// Delete YearLevel and optionally its Sections
export const deleteYearLevel = async (req, res) => {
  try {
    const yearLevelId = req.params.id;

    // Find the YearLevel by ID
    const yearLevel = await YearLevel.findById(yearLevelId);
    if (!yearLevel) {
      return res.status(404).json({ message: 'YearLevel not found' });
    }

    // Optionally, delete associated sections if required
    // (Uncomment if you need to delete sections when a YearLevel is deleted)
    // await Section.deleteMany({ _id: { $in: yearLevel.sections } });

    // Delete the YearLevel itself
    await YearLevel.deleteOne({ _id: yearLevelId });

    res.status(200).json({ message: 'YearLevel deleted successfully' });
  } catch (error) {
    console.error('Error deleting YearLevel:', error);
    res.status(500).json({ message: 'Error deleting YearLevel', error: error.message });
  }
};


export const assignSectionsToYearLevel = async (req, res) => {
  const { yearLevelId, sectionIds } = req.body;

  if (!yearLevelId || !sectionIds || sectionIds.length === 0) {
    return res.status(400).json({ message: 'YearLevel ID and sections are required' });
  }

  try {
    // Find the YearLevel by ID
    const yearLevel = await YearLevel.findById(yearLevelId);

    if (!yearLevel) {
      return res.status(404).json({ message: 'YearLevel not found' });
    }

    // Update the YearLevel's sections
    yearLevel.sections = yearLevel.sections.concat(sectionIds);  // Add the new sections
    await yearLevel.save();

    // Optionally, you can update sections to reference the YearLevel
    await Section.updateMany(
      { _id: { $in: sectionIds } },
      { $set: { yearLevel: yearLevel._id } }
    );

    res.status(200).json({ message: 'Sections assigned to YearLevel successfully', yearLevel });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning sections to YearLevel', error: error.message });
  }
};