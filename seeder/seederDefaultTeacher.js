import mongoose from 'mongoose';
import Teacher from '../models/teacher.model.js';

const seedDefaultTeacher = async () => {
  const existing = await Teacher.findOne({ email: 'default@school.com' });
  if (!existing) {
    const teacher = new Teacher({
      name: 'Default Teacher',
      email: 'default@school.com',
      password: 'defaultpassword',
    });
    await teacher.save();
    console.log('✅ Default teacher created.');
  } else {
    console.log('ℹ️ Default teacher already exists.');
  }
};

export default seedDefaultTeacher;
