const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, updateEmployee, deleteEmployee, assignRole } = require('../controllers/empController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, getEmployees);
router.post('/', authMiddleware, roleMiddleware(['Admin']), createEmployee);
router.put('/:id', authMiddleware, roleMiddleware(['Admin']), updateEmployee);
router.delete('/:id', authMiddleware, roleMiddleware(['Admin']), deleteEmployee);
router.put('/:id/assign-role', authMiddleware, roleMiddleware(['Admin']), assignRole);

module.exports = router;
