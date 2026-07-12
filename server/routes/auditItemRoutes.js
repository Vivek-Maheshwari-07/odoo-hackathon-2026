const express = require('express');
const router = express.Router();
const { 
  getAuditItems, 
  updateAuditItem, 
  createAuditItem 
} = require('../controllers/auditController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAuditItems);
router.put('/:id', authMiddleware, updateAuditItem);
router.post('/', authMiddleware, createAuditItem);

module.exports = router;
