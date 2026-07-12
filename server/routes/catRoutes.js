const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/catController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getCategories);
router.post('/', authMiddleware, roleMiddleware(['Admin']), createCategory);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteCategory);

module.exports = router;
