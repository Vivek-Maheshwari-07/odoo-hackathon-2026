const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required. Access denied.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'assetflow_jwt_secret_key_2026');

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ message: 'User profile not found. Access denied.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'User profile is inactive. Access denied.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token. Please sign in again.' });
  }
};

module.exports = authMiddleware;
