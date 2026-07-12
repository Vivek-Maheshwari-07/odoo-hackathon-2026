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

// All reports paths mapped to endpoints under /api/reports/
router.get('/dashboard', getDashboardStats);
router.get('/assets', getAssetReports);
router.get('/maintenance', getMaintenanceReports);
router.get('/bookings', getBookingReports);
router.get('/audit', getAuditReports);
router.get('/export', exportReport);

module.exports = router;
