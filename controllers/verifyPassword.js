import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Teacher from '../models/teacher.model.js';

dotenv.config();

console.log(process.env.JWT_SECRET);
