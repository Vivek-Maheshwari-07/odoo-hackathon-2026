const express = require('express');
const router = express.Router();
const { 
  getAuditItems, 
  updateAuditItem, 
  createAuditItem 
} = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), getAuditItems);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), updateAuditItem);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), createAuditItem);

module.exports = router;
