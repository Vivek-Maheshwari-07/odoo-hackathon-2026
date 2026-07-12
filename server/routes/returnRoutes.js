const express = require('express');
const router = express.Router();
const { getReturns, returnAsset } = require('../controllers/returnController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getReturns);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), returnAsset);
router.post('/:id', authMiddleware, roleMiddleware(['Admin']), returnAsset);

module.exports = router;
