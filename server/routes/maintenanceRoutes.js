// server/routes/maintenanceRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/stats', authMiddleware, ctrl.getStats);
router.get('/',    authMiddleware, ctrl.getAllRequests);
router.post('/',   authMiddleware, ctrl.createRequest);

router.get('/:id',    authMiddleware, ctrl.getRequestById);
router.put('/:id',    authMiddleware, ctrl.updateRequest);
router.delete('/:id', authMiddleware, ctrl.deleteRequest);

router.put('/:id/status', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), ctrl.updateStatus);
router.post('/:id/comments', authMiddleware, ctrl.addComment);

module.exports = router;
