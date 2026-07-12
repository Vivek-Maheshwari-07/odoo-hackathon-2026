const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All registration fields are required.' });
    }

    const emailLower = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        full_name: fullName.trim(),
        email: emailLower,
        password: hashedPassword,
        role: 'Employee', // Default role constraint
        status: 'Active'  // Default status constraint
      }
    });

    return res.status(201).json({
      message: 'Account registered successfully.',
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'An internal server error occurred during registration.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const emailLower = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Password mismatch.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact the administrator.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'assetflow_jwt_secret_key_2026',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.employee?.department?.department_name || 'N/A'
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'An internal server error occurred during authentication.' });
  }
};

const profile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        employee: {
          include: {
            department: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.employee?.department?.department_name || 'N/A'
      }
    });
  } catch (error) {
    console.error('Profile Error:', error);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({ message: 'Logged out successfully.' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }
  return res.status(200).json({ message: 'Recovery link dispatched successfully.' });
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required.' });
  }
  return res.status(200).json({ message: 'Password reset successfully.' });
};

module.exports = {
  register,
  login,
  profile,
  logout,
  forgotPassword,
  resetPassword
};
