const express = require('express');
const router = express.Router();
const {
  getAllocations,
  getAllocationStats,
  getAllocationById,
  createAllocation,
  returnAsset,
  deleteAllocation,
  getRecentAllocations,
} = require('../controllers/allocationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/stats',  authMiddleware, getAllocationStats);
router.get('/recent', authMiddleware, getRecentAllocations);
router.get('/',       authMiddleware, getAllocations);
router.get('/:id',    authMiddleware, getAllocationById);
router.post('/',      authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), createAllocation);
router.put('/:id',    authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), returnAsset);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), deleteAllocation);

module.exports = router;
