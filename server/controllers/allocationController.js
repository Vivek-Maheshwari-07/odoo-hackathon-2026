const prisma = require('../config/db');

const parseId = (value) => {
  if (value === undefined || value === null || value === '') return NaN;
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
};

const isValidDate = (value) => value && !Number.isNaN(new Date(value).getTime());

// Helper: compute display status (Overdue if active + past expected date)
const computeStatus = (allocation) => {
  if (allocation.status === 'Returned' || allocation.status === 'Transferred') return allocation.status;
  if (allocation.expected_return_date && new Date(allocation.expected_return_date) < new Date()) return 'Overdue';
  return 'Active';
};

// Helper: format allocation record for API response
const formatAllocation = (a) => ({
  id: a.id,
  assetId: a.asset_id,
  assetTag: a.asset.asset_tag,
  assetName: a.asset.asset_name,
  assetImage: a.asset.image ? `/uploads/assets/${a.asset.image}` : null,
  assetCategory: a.asset.category.category_name,
  employeeId: a.employee_id,
  employeeName: a.employee.user.full_name,
  employeeCode: a.employee.employee_code,
  employeeDesignation: a.employee.designation,
  departmentId: a.department_id,
  departmentName: a.department.department_name,
  allocatedBy: a.allocated_by,
  allocatedByName: a.allocator.full_name,
  allocationDate: a.allocation_date ? a.allocation_date.toISOString().split('T')[0] : null,
  expectedReturnDate: a.expected_return_date ? a.expected_return_date.toISOString().split('T')[0] : null,
  actualReturnDate: a.actual_return_date ? a.actual_return_date.toISOString().split('T')[0] : null,
  purpose: a.purpose || '',
  notes: a.notes || '',
  status: computeStatus(a),
  dbStatus: a.status,
  createdAt: a.created_at,
  updatedAt: a.updated_at,
});

const INCLUDE_FULL = {
  asset: { include: { category: true } },
  employee: { include: { user: true } },
  department: true,
  allocator: true,
};

// GET /api/allocations
const getAllocations = async (req, res) => {
  try {
    const { search, status, department, employee, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const where = {};
    const andFilters = [];

    if (department) {
      const departmentId = parseId(department);
      where.department = Number.isNaN(departmentId)
        ? { is: { department_name: department } }
        : { is: { id: departmentId } };
    }
    if (employee) {
      const employeeId = parseId(employee);
      where.employee = Number.isNaN(employeeId)
        ? { is: { employee_code: employee } }
        : { is: { id: employeeId } };
    }

    // Handle status filter (including Overdue which is computed)
    if (status && status !== 'All') {
      if (status === 'Overdue') {
        where.status = 'Active';
        where.expected_return_date = { lt: new Date() };
      } else if (status === 'Active') {
        where.status = 'Active';
        andFilters.push({
          OR: [
            { expected_return_date: null },
            { expected_return_date: { gte: new Date() } },
          ],
        });
      } else {
        where.status = status;
      }
    }

    if (search) {
      andFilters.push({
        OR: [
          { asset: { is: { asset_name: { contains: search } } } },
          { asset: { is: { asset_tag: { contains: search } } } },
          { employee: { is: { user: { is: { full_name: { contains: search } } } } } },
        ],
      });
    }

    if (andFilters.length) where.AND = andFilters;

    const allocations = await prisma.assetAllocation.findMany({
      where,
      include: INCLUDE_FULL,
      orderBy: { id: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.assetAllocation.count({ where });

    return res.status(200).json({
      allocations: allocations.map(formatAllocation),
      total,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error('Get Allocations Error:', error);
    return res.status(500).json({ message: 'Error retrieving allocations.' });
  }
};

// GET /api/allocations/stats — KPI metrics
const getAllocationStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd   = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [allocated, overdueCount, returnedToday, availableAssets, pendingTransfers] = await Promise.all([
      prisma.assetAllocation.count({ where: { status: 'Active' } }),
      prisma.assetAllocation.count({
        where: { status: 'Active', expected_return_date: { lt: now, not: null } }
      }),
      prisma.assetAllocation.count({
        where: { status: 'Returned', actual_return_date: { gte: todayStart, lt: todayEnd } }
      }),
      prisma.asset.count({ where: { status: 'Available' } }),
      prisma.transferRequest.count({ where: { status: 'Pending' } }),
    ]);

    return res.status(200).json({ allocated, overdueCount, returnedToday, availableAssets, pendingTransfers });
  } catch (error) {
    console.error('Stats Error:', error);
    return res.status(500).json({ message: 'Error retrieving stats.' });
  }
};

// GET /api/allocations/:id
const getAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return res.status(400).json({ message: 'Invalid allocation ID.' });

    const a = await prisma.assetAllocation.findUnique({
      where: { id: parsedId },
      include: INCLUDE_FULL,
    });

    if (!a) return res.status(404).json({ message: 'Allocation not found.' });

    // Also get transfer history for this asset
    const transfers = await prisma.transferRequest.findMany({
      where: { asset_id: a.asset_id },
      include: {
        current_employee: { include: { user: true } },
        requested_employee: { include: { user: true } },
        current_department: true,
        requested_department: true,
        approver: true,
      },
      orderBy: { id: 'desc' },
    });

    return res.status(200).json({
      ...formatAllocation(a),
      transferHistory: transfers.map(t => ({
        id: t.id,
        fromEmployee: t.current_employee.user.full_name,
        toEmployee: t.requested_employee.user.full_name,
        fromDepartment: t.current_department.department_name,
        toDepartment: t.requested_department.department_name,
        reason: t.reason,
        status: t.status,
        approvedBy: t.approver?.full_name || null,
        approvedAt: t.approved_at,
        createdAt: t.created_at,
      })),
    });
  } catch (error) {
    console.error('Get Allocation By ID Error:', error);
    return res.status(500).json({ message: 'Error retrieving allocation details.' });
  }
};

// POST /api/allocations — Allocate an asset
const createAllocation = async (req, res) => {
  try {
    const { assetId, employeeId, departmentId, allocationDate, expectedReturnDate, purpose, notes } = req.body;
    const parsedAssetId = parseId(assetId);
    const parsedEmployeeId = parseId(employeeId);
    const parsedDepartmentId = parseId(departmentId);

    if (Number.isNaN(parsedAssetId) || Number.isNaN(parsedEmployeeId) || Number.isNaN(parsedDepartmentId) || !allocationDate) {
      return res.status(400).json({ message: 'Asset, employee, department, and allocation date are required.' });
    }
    if (!isValidDate(allocationDate)) {
      return res.status(400).json({ message: 'Allocation date is invalid.' });
    }
    if (expectedReturnDate && !isValidDate(expectedReturnDate)) {
      return res.status(400).json({ message: 'Expected return date is invalid.' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: parsedAssetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    if (asset.status !== 'Available') {
      return res.status(400).json({ message: `Asset is currently "${asset.status}" and cannot be allocated. Use Transfer instead.` });
    }

    const employee = await prisma.employee.findUnique({ where: { id: parsedEmployeeId } });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    if (employee.status !== 'Active') return res.status(400).json({ message: 'Selected employee is not active.' });

    const department = await prisma.department.findUnique({ where: { id: parsedDepartmentId } });
    if (!department) return res.status(404).json({ message: 'Department not found.' });
    if (department.status !== 'Active') return res.status(400).json({ message: 'Selected department is not active.' });

    if (expectedReturnDate && new Date(expectedReturnDate) <= new Date(allocationDate)) {
      return res.status(400).json({ message: 'Expected return date must be after allocation date.' });
    }

    // Create allocation + update asset status atomically
    const [allocation] = await prisma.$transaction([
      prisma.assetAllocation.create({
        data: {
          asset_id: parsedAssetId,
          employee_id: parsedEmployeeId,
          department_id: parsedDepartmentId,
          allocated_by: req.user.id,
          allocation_date: new Date(allocationDate),
          expected_return_date: expectedReturnDate ? new Date(expectedReturnDate) : null,
          purpose: purpose?.trim() || null,
          notes: notes?.trim() || null,
          status: 'Active',
        },
      }),
      prisma.asset.update({
        where: { id: parsedAssetId },
        data: { status: 'Allocated', department_id: parsedDepartmentId },
      }),
    ]);

    return res.status(201).json({ message: 'Asset allocated successfully.', allocationId: allocation.id });
  } catch (error) {
    console.error('Create Allocation Error:', error);
    return res.status(500).json({ message: 'Error creating allocation.' });
  }
};

// PUT /api/allocations/:id — Return an asset
const returnAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return res.status(400).json({ message: 'Invalid allocation ID.' });

    const allocation = await prisma.assetAllocation.findUnique({ where: { id: parsedId } });
    if (!allocation) return res.status(404).json({ message: 'Allocation not found.' });
    if (allocation.status === 'Returned') return res.status(400).json({ message: 'Asset has already been returned.' });
    if (allocation.status === 'Transferred') return res.status(400).json({ message: 'Transferred allocations cannot be returned.' });

    const { condition, returnNotes } = req.body;
    const allowedConditions = ['New', 'Good', 'Fair', 'Poor'];
    if (condition && !allowedConditions.includes(condition)) {
      return res.status(400).json({ message: 'Invalid return condition.' });
    }

    await prisma.$transaction([
      prisma.assetAllocation.update({
        where: { id: parsedId },
        data: {
          status: 'Returned',
          actual_return_date: new Date(),
          notes: returnNotes ? (allocation.notes ? `${allocation.notes}\n\nReturn notes: ${returnNotes}` : `Return notes: ${returnNotes}`) : allocation.notes,
        },
      }),
      prisma.asset.update({
        where: { id: allocation.asset_id },
        data: {
          status: 'Available',
          condition: condition || undefined,
        },
      }),
    ]);

    return res.status(200).json({ message: 'Asset returned successfully.' });
  } catch (error) {
    console.error('Return Asset Error:', error);
    return res.status(500).json({ message: 'Error processing asset return.' });
  }
};

// DELETE /api/allocations/:id
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return res.status(400).json({ message: 'Invalid allocation ID.' });

    const allocation = await prisma.assetAllocation.findUnique({ where: { id: parsedId } });
    if (!allocation) return res.status(404).json({ message: 'Allocation not found.' });
    if (allocation.status === 'Active') {
      return res.status(400).json({ message: 'Cannot delete an active allocation. Return the asset first.' });
    }

    await prisma.assetAllocation.delete({ where: { id: parsedId } });
    return res.status(200).json({ message: 'Allocation record deleted.' });
  } catch (error) {
    console.error('Delete Allocation Error:', error);
    return res.status(500).json({ message: 'Error deleting allocation.' });
  }
};

// GET /api/allocations/recent — For dashboard
const getRecentAllocations = async (req, res) => {
  try {
    const allocations = await prisma.assetAllocation.findMany({
      include: INCLUDE_FULL,
      orderBy: { created_at: 'desc' },
      take: 8,
    });
    return res.status(200).json(allocations.map(formatAllocation));
  } catch (error) {
    console.error('Recent Allocations Error:', error);
    return res.status(500).json({ message: 'Error retrieving recent allocations.' });
  }
};

module.exports = {
  getAllocations,
  getAllocationStats,
  getAllocationById,
  createAllocation,
  returnAsset,
  deleteAllocation,
  getRecentAllocations,
};
