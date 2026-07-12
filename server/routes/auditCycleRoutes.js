const express = require('express');
const router = express.Router();
const { 
  getAuditCycles, 
  createAuditCycle, 
  updateAuditCycle, 
  deleteAuditCycle 
} = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getAuditCycles);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), createAuditCycle);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), updateAuditCycle);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteAuditCycle);

module.exports = router;
