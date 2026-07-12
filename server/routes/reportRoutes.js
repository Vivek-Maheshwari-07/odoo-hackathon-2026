const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAssetReports,
  getMaintenanceReports,
  getBookingReports,
  getAuditReports,
  exportReport
} = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All reports paths mapped to endpoints under /api/reports/
router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/assets', authMiddleware, getAssetReports);
router.get('/maintenance', authMiddleware, getMaintenanceReports);
router.get('/bookings', authMiddleware, getBookingReports);
router.get('/audit', authMiddleware, getAuditReports);
router.get('/export', authMiddleware, exportReport);

module.exports = router;
