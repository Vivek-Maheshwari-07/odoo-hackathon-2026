const express = require('express');
const router = express.Router();
const {
  getTransfers,
  getRecentTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
} = require('../controllers/transferController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/recent',       authMiddleware, getRecentTransfers);
router.get('/',             authMiddleware, getTransfers);
router.post('/',            authMiddleware, createTransfer);
router.put('/:id/approve',  authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), approveTransfer);
router.put('/:id/reject',   authMiddleware, roleMiddleware(['Admin', 'Asset Manager', 'Department Head']), rejectTransfer);

module.exports = router;
