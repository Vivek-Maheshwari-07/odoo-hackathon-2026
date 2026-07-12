const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/deptController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getDepartments);
router.post('/', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), createDepartment);
router.put('/:id', authMiddleware, roleMiddleware(['Admin', 'Asset Manager']), updateDepartment);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteDepartment);

module.exports = router;
