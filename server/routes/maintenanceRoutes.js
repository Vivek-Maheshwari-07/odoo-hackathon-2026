// server/routes/maintenanceRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/maintenanceController');

router.get('/stats', ctrl.getStats);
router.get('/',    ctrl.getAllRequests);
router.post('/',   ctrl.createRequest);

router.get('/:id',    ctrl.getRequestById);
router.put('/:id',    ctrl.updateRequest);
router.delete('/:id', ctrl.deleteRequest);

router.put('/:id/status', ctrl.updateStatus);
router.post('/:id/comments', ctrl.addComment);

module.exports = router;
