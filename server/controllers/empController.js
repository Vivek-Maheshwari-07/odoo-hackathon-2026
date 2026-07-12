const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const getEmployees = async (req, res) => {
  try {
    const emps = await prisma.employee.findMany({
      include: {
        user: true,
        department: true
      }
    });

    const result = emps.map(e => ({
      id: `EMP${String(e.id).padStart(3, '0')}`,
      dbId: e.id,
      fullName: e.user.full_name,
      name: e.user.full_name,
      email: e.user.email,
      userId: e.user_id,
      department: e.department.department_name,
      deptId: e.department_id,
      departmentId: e.department_id,
      departmentName: e.department.department_name,
      role: e.user.role,
      status: e.status,
      employeeCode: e.employee_code,
      designation: e.designation,
      phone: e.phone
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Employees Error:', error);
    return res.status(500).json({ message: 'Error retrieving employee roster.' });
  }
};

const createEmployee = async (req, res) => {
  try {
    const { name, email, department, status } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({ message: 'Full Name, Email, and Department are required.' });
    }

    const emailLower = email.trim().toLowerCase();

    const dept = await prisma.department.findUnique({
      where: { department_name: department.trim() }
    });
    if (!dept) {
      return res.status(400).json({ message: 'Selected department does not exist.' });
    }

    let user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (user) {
      const existingEmp = await prisma.employee.findUnique({
        where: { user_id: user.id }
      });
      if (existingEmp) {
        return res.status(400).json({ message: 'An employee profile with this email address already exists.' });
      }
    } else {
      const hashedPassword = await bcrypt.hash('Password123', 10);
      user = await prisma.user.create({
        data: {
          full_name: name.trim(),
          email: emailLower,
          password: hashedPassword,
          role: 'Employee', 
          status: status || 'Active'
        }
      });
    }

    const count = await prisma.employee.count();
    const employeeCode = `EMP-CODE-${String(count + 1).padStart(4, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        user_id: user.id,
        department_id: dept.id,
        employee_code: employeeCode,
        designation: 'Employee',
        phone: '',
        status: status || 'Active'
      }
    });

    return res.status(201).json({
      message: 'Employee registered successfully.',
      employee
    });
  } catch (error) {
    console.error('Create Employee Error:', error);
    return res.status(500).json({ message: 'Error registering employee.' });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, status } = req.body;

    const parsedId = parseInt(String(id).replace('EMP', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const emp = await prisma.employee.findUnique({
      where: { id: parsedId },
      include: { user: true }
    });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    let deptId = emp.department_id;
    if (department) {
      const dept = await prisma.department.findUnique({
        where: { department_name: department.trim() }
      });
      if (!dept) {
        return res.status(400).json({ message: 'Selected department does not exist.' });
      }
      deptId = dept.id;
    }

    if (email && email.trim().toLowerCase() !== emp.user.email) {
      const emailLower = email.trim().toLowerCase();
      const duplicate = await prisma.user.findUnique({
        where: { email: emailLower }
      });
      if (duplicate) {
        return res.status(400).json({ message: 'An employee with this email address already exists.' });
      }
    }

    await prisma.user.update({
      where: { id: emp.user_id },
      data: {
        full_name: name ? name.trim() : emp.user.full_name,
        email: email ? email.trim().toLowerCase() : emp.user.email,
        status: status || emp.user.status
      }
    });

    const updatedEmp = await prisma.employee.update({
      where: { id: parsedId },
      data: {
        department_id: deptId,
        status: status || emp.status
      }
    });

    return res.status(200).json({
      message: 'Employee updated successfully.',
      employee: updatedEmp
    });
  } catch (error) {
    console.error('Update Employee Error:', error);
    return res.status(500).json({ message: 'Error updating employee record.' });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(String(id).replace('EMP', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const emp = await prisma.employee.findUnique({
      where: { id: parsedId }
    });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    await prisma.user.delete({
      where: { id: emp.user_id }
    });

    return res.status(200).json({ message: 'Employee and user profile deleted successfully.' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    return res.status(500).json({ message: 'Error deleting employee.' });
  }
};

const assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: 'Role field is required.' });
    }

    const parsedId = parseInt(String(id).replace('EMP', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid employee ID.' });
    }

    const emp = await prisma.employee.findUnique({
      where: { id: parsedId },
      include: { user: true }
    });
    if (!emp) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: emp.user_id },
      data: { role }
    });

    if (role === 'Department Head') {
      await prisma.department.updateMany({
        where: { id: emp.department_id },
        data: { department_head_id: emp.id }
      });
    }

    return res.status(200).json({
      message: 'Employee role assigned successfully.',
      role: updatedUser.role
    });
  } catch (error) {
    console.error('Assign Role Error:', error);
    return res.status(500).json({ message: 'Error promoting employee role.' });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  assignRole
};
