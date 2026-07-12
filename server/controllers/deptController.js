const prisma = require('../config/db');

const getDepartments = async (req, res) => {
  try {
    const depts = await prisma.department.findMany();

    const result = await Promise.all(depts.map(async (d) => {
      let headName = 'None';
      if (d.department_head_id) {
        const headEmp = await prisma.employee.findUnique({
          where: { id: d.department_head_id },
          include: { user: true }
        });
        if (headEmp && headEmp.user) {
          headName = headEmp.user.full_name;
        }
      }

      let parentName = '';
      if (d.parent_department_id) {
        const parentDept = await prisma.department.findUnique({
          where: { id: d.parent_department_id }
        });
        if (parentDept) {
          parentName = parentDept.department_name;
        }
      }

      return {
        id: `DP${String(d.id).padStart(3, '0')}`,
        dbId: d.id,
        name: d.department_name,
        department_name: d.department_name,
        head: headName,
        headId: d.department_head_id,
        parent: parentName,
        parentId: d.parent_department_id,
        status: d.status
      };
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Departments Error:', error);
    return res.status(500).json({ message: 'Error retrieving departments list.' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, head, parent, status } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required.' });
    }

    const existing = await prisma.department.findUnique({
      where: { department_name: name.trim() }
    });
    if (existing) {
      return res.status(400).json({ message: 'A department with this name already exists.' });
    }

    let headId = null;
    if (head && head !== 'None') {
      const user = await prisma.user.findFirst({
        where: { full_name: head.trim() }
      });
      if (user) {
        const emp = await prisma.employee.findUnique({
          where: { user_id: user.id }
        });
        if (emp) headId = emp.id;
      }
    }

    let parentId = null;
    if (parent && parent !== '') {
      const parentDept = await prisma.department.findUnique({
        where: { department_name: parent.trim() }
      });
      if (parentDept) {
        parentId = parentDept.id;
      }
    }

    const newDept = await prisma.department.create({
      data: {
        department_name: name.trim(),
        department_head_id: headId,
        parent_department_id: parentId,
        status: status || 'Active'
      }
    });

    return res.status(201).json({
      message: 'Department created successfully.',
      department: newDept
    });
  } catch (error) {
    console.error('Create Department Error:', error);
    return res.status(500).json({ message: 'Error creating new department.' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, head, parent, status } = req.body;

    const parsedId = parseInt(String(id).replace('DP', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid department ID.' });
    }

    const existingDept = await prisma.department.findUnique({
      where: { id: parsedId }
    });
    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    if (name && name.trim() !== existingDept.department_name) {
      const duplicate = await prisma.department.findUnique({
        where: { department_name: name.trim() }
      });
      if (duplicate) {
        return res.status(400).json({ message: 'A department with this name already exists.' });
      }
    }

    let headId = existingDept.department_head_id;
    if (head !== undefined) {
      if (head === 'None' || !head) {
        headId = null;
      } else {
        const user = await prisma.user.findFirst({
          where: { full_name: head.trim() }
        });
        if (user) {
          const emp = await prisma.employee.findUnique({
            where: { user_id: user.id }
          });
          if (emp) headId = emp.id;
        }
      }
    }

    let parentId = existingDept.parent_department_id;
    if (parent !== undefined) {
      if (!parent) {
        parentId = null;
      } else {
        const parentDept = await prisma.department.findUnique({
          where: { department_name: parent.trim() }
        });
        if (parentDept) {
          parentId = parentDept.id;
        }
      }
    }

    const updated = await prisma.department.update({
      where: { id: parsedId },
      data: {
        department_name: name ? name.trim() : existingDept.department_name,
        department_head_id: headId,
        parent_department_id: parentId,
        status: status || existingDept.status
      }
    });

    return res.status(200).json({
      message: 'Department updated successfully.',
      department: updated
    });
  } catch (error) {
    console.error('Update Department Error:', error);
    return res.status(500).json({ message: 'Error updating department.' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(String(id).replace('DP', ''), 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid department ID.' });
    }

    const existingDept = await prisma.department.findUnique({
      where: { id: parsedId }
    });
    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    await prisma.department.delete({
      where: { id: parsedId }
    });

    return res.status(200).json({ message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Delete Department Error:', error);
    return res.status(500).json({ message: 'Error deleting department.' });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
