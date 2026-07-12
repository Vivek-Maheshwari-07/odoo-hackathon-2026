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
const roleMiddleware = require('../middleware/roleMiddleware');

// All reports paths mapped to endpoints under /api/reports/
router.get('/dashboard', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), getDashboardStats);
router.get('/assets', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), getAssetReports);
router.get('/maintenance', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), getMaintenanceReports);
router.get('/bookings', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), getBookingReports);
router.get('/audit', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), getAuditReports);
router.get('/export', authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), exportReport);

module.exports = router;
