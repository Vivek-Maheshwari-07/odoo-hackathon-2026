const prisma = require('../config/db');
const { returnAsset } = require('./allocationController');

const INCLUDE_RETURN = {
  asset: { include: { category: true } },
  employee: { include: { user: true } },
  department: true,
  allocator: true,
};

const formatReturn = (allocation) => ({
  id: allocation.id,
  assetId: allocation.asset_id,
  assetTag: allocation.asset.asset_tag,
  assetName: allocation.asset.asset_name,
  assetCategory: allocation.asset.category.category_name,
  employeeId: allocation.employee_id,
  employeeName: allocation.employee.user.full_name,
  employeeCode: allocation.employee.employee_code,
  departmentId: allocation.department_id,
  departmentName: allocation.department.department_name,
  allocatedByName: allocation.allocator.full_name,
  allocationDate: allocation.allocation_date ? allocation.allocation_date.toISOString().split('T')[0] : null,
  expectedReturnDate: allocation.expected_return_date ? allocation.expected_return_date.toISOString().split('T')[0] : null,
  actualReturnDate: allocation.actual_return_date ? allocation.actual_return_date.toISOString().split('T')[0] : null,
  notes: allocation.notes || '',
  status: allocation.status,
  createdAt: allocation.created_at,
  updatedAt: allocation.updated_at,
});

const getReturns = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const where = { status: 'Returned' };

    if (search) {
      where.OR = [
        { asset: { is: { asset_name: { contains: search } } } },
        { asset: { is: { asset_tag: { contains: search } } } },
        { employee: { is: { user: { is: { full_name: { contains: search } } } } } },
      ];
    }

    const [returns, total] = await Promise.all([
      prisma.assetAllocation.findMany({
        where,
        include: INCLUDE_RETURN,
        orderBy: { actual_return_date: 'desc' },
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
      }),
      prisma.assetAllocation.count({ where }),
    ]);

    return res.status(200).json({
      returns: returns.map(formatReturn),
      total,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    console.error('Get Returns Error:', error);
    return res.status(500).json({ message: 'Error retrieving return history.' });
  }
};

module.exports = {
  getReturns,
  returnAsset,
};
