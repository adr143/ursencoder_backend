import jwt from 'jsonwebtoken';  // Import the jsonwebtoken library to handle JWTs
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);  // Log the decoded token to verify its contents
        req.teacher = decoded;  
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};
