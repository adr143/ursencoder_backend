import mongoose from 'mongoose';

const yearLevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',  // Reference to the Section model
  }],
});

const YearLevel = mongoose.model('YearLevel', yearLevelSchema);
export default YearLevel;
