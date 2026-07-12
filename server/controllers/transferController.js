const prisma = require('../config/db');

const parseId = (value) => {
  if (value === undefined || value === null || value === '') return NaN;
  const match = String(value).match(/\d+/);
  return match ? parseInt(match[0], 10) : NaN;
};

const INCLUDE_FULL = {
  asset: { include: { category: true } },
  current_employee: { include: { user: true } },
  requested_employee: { include: { user: true } },
  current_department: true,
  requested_department: true,
  approver: true,
};

const formatTransfer = (t) => ({
  id: t.id,
  assetId: t.asset_id,
  assetTag: t.asset.asset_tag,
  assetName: t.asset.asset_name,
  assetCategory: t.asset.category.category_name,
  currentEmployeeId: t.current_employee_id,
  currentEmployeeName: t.current_employee.user.full_name,
  currentEmployeeCode: t.current_employee.employee_code,
  requestedEmployeeId: t.requested_employee_id,
  requestedEmployeeName: t.requested_employee.user.full_name,
  requestedEmployeeCode: t.requested_employee.employee_code,
  currentDepartmentId: t.current_department_id,
  currentDepartmentName: t.current_department.department_name,
  requestedDepartmentId: t.requested_department_id,
  requestedDepartmentName: t.requested_department.department_name,
  reason: t.reason || '',
  status: t.status,
  approvedBy: t.approved_by,
  approvedByName: t.approver?.full_name || null,
  approvedAt: t.approved_at,
  createdAt: t.created_at,
  updatedAt: t.updated_at,
});

// GET /api/transfers
const getTransfers = async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const where = {};
    const hasPagination = page !== undefined || limit !== undefined;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    if (status && status !== 'All') where.status = status;

    if (search) {
      where.OR = [
        { asset: { is: { asset_name: { contains: search } } } },
        { asset: { is: { asset_tag: { contains: search } } } },
        { current_employee: { is: { user: { is: { full_name: { contains: search } } } } } },
        { requested_employee: { is: { user: { is: { full_name: { contains: search } } } } } },
      ];
    }

    const query = {
      where,
      include: INCLUDE_FULL,
      orderBy: { id: 'desc' },
    };

    if (hasPagination) {
      query.skip = (pageNumber - 1) * pageSize;
      query.take = pageSize;
    }

    const transfers = await prisma.transferRequest.findMany(query);

    if (!hasPagination) return res.status(200).json(transfers.map(formatTransfer));

    const total = await prisma.transferRequest.count({ where });
    return res.status(200).json({
      transfers: transfers.map(formatTransfer),
      total,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error('Get Transfers Error:', error);
    return res.status(500).json({ message: 'Error retrieving transfer requests.' });
  }
};

// GET /api/transfers/recent
const getRecentTransfers = async (req, res) => {
  try {
    const transfers = await prisma.transferRequest.findMany({
      include: INCLUDE_FULL,
      orderBy: { created_at: 'desc' },
      take: 8,
    });
    return res.status(200).json(transfers.map(formatTransfer));
  } catch (error) {
    console.error('Recent Transfers Error:', error);
    return res.status(500).json({ message: 'Error retrieving recent transfers.' });
  }
};

// POST /api/transfers — Create transfer request
const createTransfer = async (req, res) => {
  try {
    const { assetId, requestedEmployeeId, requestedDepartmentId, reason } = req.body;
    const parsedAssetId = parseId(assetId);
    const parsedEmployeeId = parseId(requestedEmployeeId);
    const parsedDepartmentId = parseId(requestedDepartmentId);

    if (Number.isNaN(parsedAssetId) || Number.isNaN(parsedEmployeeId) || Number.isNaN(parsedDepartmentId)) {
      return res.status(400).json({ message: 'Asset, requested employee, and department are required.' });
    }

    const asset = await prisma.asset.findUnique({ where: { id: parsedAssetId } });
    if (!asset) return res.status(404).json({ message: 'Asset not found.' });
    if (asset.status !== 'Allocated') {
      return res.status(400).json({ message: 'Transfer requests can only be created for currently allocated assets.' });
    }

    // Find active allocation to get current holder
    const activeAllocation = await prisma.assetAllocation.findFirst({
      where: { asset_id: parsedAssetId, status: 'Active' },
      include: { employee: true, department: true },
    });

    if (!activeAllocation) {
      return res.status(400).json({ message: 'No active allocation found for this asset.' });
    }

    // Check no pending transfer already exists
    const pending = await prisma.transferRequest.findFirst({
      where: { asset_id: parsedAssetId, status: 'Pending' },
    });
    if (pending) {
      return res.status(400).json({ message: 'A pending transfer request already exists for this asset.' });
    }

    const requestedEmployee = await prisma.employee.findUnique({ where: { id: parsedEmployeeId } });
    if (!requestedEmployee) return res.status(404).json({ message: 'Requested employee not found.' });
    if (requestedEmployee.status !== 'Active') return res.status(400).json({ message: 'Requested employee is not active.' });
    if (requestedEmployee.id === activeAllocation.employee_id) {
      return res.status(400).json({ message: 'Asset is already allocated to the selected employee.' });
    }

    const requestedDepartment = await prisma.department.findUnique({ where: { id: parsedDepartmentId } });
    if (!requestedDepartment) return res.status(404).json({ message: 'Requested department not found.' });
    if (requestedDepartment.status !== 'Active') return res.status(400).json({ message: 'Requested department is not active.' });

    const transfer = await prisma.transferRequest.create({
      data: {
        asset_id: parsedAssetId,
        current_employee_id: activeAllocation.employee_id,
        requested_employee_id: parsedEmployeeId,
        current_department_id: activeAllocation.department_id,
        requested_department_id: parsedDepartmentId,
        reason: reason?.trim() || null,
        status: 'Pending',
      },
    });

    return res.status(201).json({ message: 'Transfer request submitted successfully.', transferId: transfer.id });
  } catch (error) {
    console.error('Create Transfer Error:', error);
    return res.status(500).json({ message: 'Error creating transfer request.' });
  }
};

// PUT /api/transfers/:id/approve — Approve and reallocate
const approveTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return res.status(400).json({ message: 'Invalid transfer ID.' });

    const transfer = await prisma.transferRequest.findUnique({
      where: { id: parsedId },
      include: { requested_employee: true, requested_department: true },
    });
    if (!transfer) return res.status(404).json({ message: 'Transfer request not found.' });
    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending transfer requests can be approved.' });
    }

    // Find and update active allocation → mark as Transferred
    await prisma.$transaction(async (tx) => {
      const activeAllocation = await tx.assetAllocation.findFirst({
        where: {
          asset_id: transfer.asset_id,
          employee_id: transfer.current_employee_id,
          status: 'Active',
        },
      });

      if (!activeAllocation) {
        throw new Error('No active allocation found for this transfer request.');
      }

      // Close old allocation
      await tx.assetAllocation.update({
        where: { id: activeAllocation.id },
        data: { status: 'Transferred', actual_return_date: new Date() },
      });

      // Create new allocation for the new holder
      await tx.assetAllocation.create({
        data: {
          asset_id: transfer.asset_id,
          employee_id: transfer.requested_employee_id,
          department_id: transfer.requested_department_id,
          allocated_by: req.user.id,
          allocation_date: new Date(),
          status: 'Active',
          purpose: 'Transfer from approved request',
          notes: transfer.reason,
        },
      });

      // Update asset department
      await tx.asset.update({
        where: { id: transfer.asset_id },
        data: {
          status: 'Allocated',
          department_id: transfer.requested_department_id,
        },
      });

      // Mark transfer as Approved
      await tx.transferRequest.update({
        where: { id: parsedId },
        data: {
          status: 'Approved',
          approved_by: req.user.id,
          approved_at: new Date(),
        },
      });
    });

    return res.status(200).json({ message: 'Transfer approved and asset reallocated successfully.' });
  } catch (error) {
    console.error('Approve Transfer Error:', error);
    return res.status(500).json({ message: 'Error approving transfer.' });
  }
};

// PUT /api/transfers/:id/reject
const rejectTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) return res.status(400).json({ message: 'Invalid transfer ID.' });

    const transfer = await prisma.transferRequest.findUnique({ where: { id: parsedId } });
    if (!transfer) return res.status(404).json({ message: 'Transfer request not found.' });
    if (transfer.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending transfer requests can be rejected.' });
    }

    await prisma.transferRequest.update({
      where: { id: parsedId },
      data: {
        status: 'Rejected',
        approved_by: req.user.id,
        approved_at: new Date(),
      },
    });

    return res.status(200).json({ message: 'Transfer request rejected.' });
  } catch (error) {
    console.error('Reject Transfer Error:', error);
    return res.status(500).json({ message: 'Error rejecting transfer.' });
  }
};

module.exports = {
  getTransfers,
  getRecentTransfers,
  createTransfer,
  approveTransfer,
  rejectTransfer,
};
