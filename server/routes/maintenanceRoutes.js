// server/routes/maintenanceRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, ctrl.getStats);
router.get('/',    authMiddleware, ctrl.getAllRequests);
router.post('/',   authMiddleware, ctrl.createRequest);

router.get('/:id',    authMiddleware, ctrl.getRequestById);
router.put('/:id',    authMiddleware, ctrl.updateRequest);
router.delete('/:id', authMiddleware, ctrl.deleteRequest);

router.put('/:id/status', authMiddleware, ctrl.updateStatus);
router.post('/:id/comments', authMiddleware, ctrl.addComment);

module.exports = router;
