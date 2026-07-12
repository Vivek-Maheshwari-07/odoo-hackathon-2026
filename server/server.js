const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for development and testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json());

// Serve static uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/departments', require('./routes/deptRoutes'));
app.use('/api/categories', require('./routes/catRoutes'));
app.use('/api/employees', require('./routes/empRoutes'));
app.use('/api/assets', require('./routes/assetRoutes'));

// Root path fallback
app.get('/', (req, res) => {
  res.send('AssetFlow API Gateway is operational.');
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error:', err.stack);
  res.status(500).json({ message: 'An internal server error occurred.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
