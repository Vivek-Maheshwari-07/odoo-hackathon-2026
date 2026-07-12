const fs = require('fs');
const path = require('path');
const multer = require('multer');
const prisma = require('../config/db');

// Ensure directory exists
const uploadDir = path.join(__dirname, '../../uploads/assets');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'asset-' + uniqueSuffix + ext);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const getAssets = async (req, res) => {
  try {
    const { search, category, status, department, location } = req.query;

    const where = {};
    const user = req.user;

    if (user.role === 'Employee') {
      where.allocations = {
        some: {
          employee: { user_id: user.id },
          status: 'Active'
        }
      };
    } else if (user.role === 'Department Head') {
      const empProfile = await prisma.employee.findUnique({
        where: { user_id: user.id }
      });
      if (empProfile) {
        where.department_id = empProfile.department_id;
      }
    }

    if (category && category !== 'All') {
      where.category = {
        is: { category_name: category }
      };
    }

    if (status && status !== 'All') {
      where.status = status;
    }

    if (department && department !== 'All') {
      where.department = {
        is: { department_name: department }
      };
    }

    if (location && location !== 'All') {
      where.location = { contains: location };
    }

    if (search) {
      where.OR = [
        { asset_name: { contains: search } },
        { asset_tag: { contains: search } },
        { serial_number: { contains: search } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        department: true,
        allocations: {
          where: { status: 'Active' },
          include: { employee: { include: { user: true } } },
          orderBy: { id: 'desc' },
          take: 1
        }
      },
      orderBy: {
        id: 'desc'
      }
    });

    const results = assets.map(a => ({
      id: a.id,
      assetTag: a.asset_tag,
      assetName: a.asset_name,
      category: a.category.category_name,
      categoryId: a.category_id,
      serialNumber: a.serial_number,
      status: a.status,
      location: a.location,
      purchaseDate: a.purchase_date ? a.purchase_date.toISOString().split('T')[0] : '',
      purchaseCost: a.purchase_cost || 0,
      condition: a.condition,
      department: a.department.department_name,
      departmentId: a.department_id,
      image: a.image ? `/uploads/assets/${a.image}` : null,
      isShared: a.is_shared,
      description: a.description || '',
      assignedTo: a.allocations[0]?.employee?.user?.full_name || 'None',
      assignedEmployeeId: a.allocations[0]?.employee_id || null
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Get Assets Error:', error);
    return res.status(500).json({ message: 'Error retrieving assets inventory.' });
  }
};

const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid asset ID.' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: parsedId },
      include: {
        category: true,
        department: true,
        allocations: {
          include: {
            employee: { include: { user: true } },
            department: true,
            allocator: true
          },
          orderBy: { allocation_date: 'desc' }
        },
        transfer_requests: {
          include: {
            current_employee: { include: { user: true } },
            requested_employee: { include: { user: true } },
            current_department: true,
            requested_department: true,
            approver: true
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    const allocationHistory = asset.allocations.map(a => ({
      id: a.id,
      employee: a.employee.user.full_name,
      employeeCode: a.employee.employee_code,
      department: a.department.department_name,
      allocatedBy: a.allocator.full_name,
      allocatedDate: a.allocation_date ? a.allocation_date.toISOString().split('T')[0] : '',
      expectedReturnDate: a.expected_return_date ? a.expected_return_date.toISOString().split('T')[0] : '',
      returnedDate: a.actual_return_date ? a.actual_return_date.toISOString().split('T')[0] : '',
      status: a.status,
      purpose: a.purpose || '',
      notes: a.notes || ''
    }));

    const transferHistory = asset.transfer_requests.map(t => ({
      id: t.id,
      fromEmployee: t.current_employee.user.full_name,
      toEmployee: t.requested_employee.user.full_name,
      fromDepartment: t.current_department.department_name,
      toDepartment: t.requested_department.department_name,
      reason: t.reason || '',
      status: t.status,
      approvedBy: t.approver?.full_name || null,
      approvedAt: t.approved_at ? t.approved_at.toISOString().split('T')[0] : '',
      createdAt: t.created_at ? t.created_at.toISOString().split('T')[0] : ''
    }));

    const timeline = [
      {
        id: `asset-${asset.id}`,
        type: 'status',
        label: 'Asset Registered',
        date: asset.created_at.toISOString().split('T')[0],
        user: 'System'
      },
      ...asset.allocations.map(a => ({
        id: `allocation-${a.id}`,
        type: 'allocation',
        label: `${a.status === 'Active' ? 'Allocated to' : a.status} ${a.employee.user.full_name}`,
        date: a.allocation_date ? a.allocation_date.toISOString().split('T')[0] : '',
        user: a.allocator.full_name
      })),
      ...asset.allocations
        .filter(a => a.status === 'Returned' && a.actual_return_date)
        .map(a => ({
          id: `return-${a.id}`,
          type: 'return',
          label: `Returned by ${a.employee.user.full_name}`,
          date: a.actual_return_date.toISOString().split('T')[0],
          user: a.employee.user.full_name
        })),
      ...asset.transfer_requests.map(t => ({
        id: `transfer-${t.id}`,
        type: 'transfer',
        label: `Transfer ${t.status}: ${t.current_employee.user.full_name} to ${t.requested_employee.user.full_name}`,
        date: (t.approved_at || t.created_at).toISOString().split('T')[0],
        user: t.approver?.full_name || 'Pending approval'
      }))
    ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    const activeAllocation = asset.allocations.find(a => a.status === 'Active');

    const result = {
      id: asset.id,
      assetTag: asset.asset_tag,
      assetName: asset.asset_name,
      category: asset.category.category_name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      status: asset.status,
      location: asset.location,
      purchaseDate: asset.purchase_date ? asset.purchase_date.toISOString().split('T')[0] : '',
      purchaseCost: asset.purchase_cost || 0,
      condition: asset.condition,
      department: asset.department.department_name,
      departmentId: asset.department_id,
      image: asset.image ? `/uploads/assets/${asset.image}` : null,
      isShared: asset.is_shared,
      description: asset.description || '',
      assignedTo: activeAllocation?.employee?.user?.full_name || 'None',
      assignedEmployeeId: activeAllocation?.employee_id || null,
      timeline,
      allocationHistory,
      transferHistory,
      returnHistory: allocationHistory.filter(h => h.status === 'Returned'),
      maintenanceHistory: []
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Asset By ID Error:', error);
    return res.status(500).json({ message: 'Error retrieving asset details.' });
  }
};

const createAsset = async (req, res) => {
  try {
    const {
      assetName,
      category,
      serialNumber,
      purchaseDate,
      purchaseCost,
      condition,
      location,
      department,
      isShared,
      description,
      status
    } = req.body;

    if (!assetName || !category || !serialNumber || !location || !department || !status) {
      return res.status(400).json({ message: 'Missing required registration fields.' });
    }

    const duplicate = await prisma.asset.findUnique({
      where: { serial_number: serialNumber.trim() }
    });
    if (duplicate) {
      return res.status(400).json({ message: `Serial Number "${serialNumber}" is already in use by another asset.` });
    }

    const categoryRecord = await prisma.assetCategory.findUnique({
      where: { category_name: category.trim() }
    });
    if (!categoryRecord) {
      return res.status(400).json({ message: `Selected category "${category}" does not exist.` });
    }

    const departmentRecord = await prisma.department.findUnique({
      where: { department_name: department.trim() }
    });
    if (!departmentRecord) {
      return res.status(400).json({ message: `Selected department "${department}" does not exist.` });
    }

    const lastAsset = await prisma.asset.findFirst({
      orderBy: { id: 'desc' }
    });
    let nextNum = 1;
    if (lastAsset) {
      const match = lastAsset.asset_tag.match(/AF-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    const assetTag = `AF-${String(nextNum).padStart(4, '0')}`;

    const imageName = req.file ? req.file.filename : null;

    const newAsset = await prisma.asset.create({
      data: {
        asset_tag: assetTag,
        asset_name: assetName.trim(),
        category_id: categoryRecord.id,
        serial_number: serialNumber.trim(),
        purchase_date: purchaseDate ? new Date(purchaseDate) : null,
        purchase_cost: purchaseCost ? parseFloat(purchaseCost) : null,
        condition: condition || 'Good',
        location: location.trim(),
        department_id: departmentRecord.id,
        description: description ? description.trim() : '',
        image: imageName,
        is_shared: isShared === 'true' || isShared === true,
        status: status || 'Available'
      }
    });

    return res.status(201).json({
      message: `Asset registered successfully under tag ${assetTag}.`,
      asset: newAsset
    });
  } catch (error) {
    console.error('Create Asset Error:', error);
    return res.status(500).json({ message: 'Error registering new asset.' });
  }
};

const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid asset ID.' });
    }

    const {
      assetName,
      category,
      serialNumber,
      purchaseDate,
      purchaseCost,
      condition,
      location,
      department,
      isShared,
      description,
      status
    } = req.body;

    const asset = await prisma.asset.findUnique({
      where: { id: parsedId }
    });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    if (serialNumber && serialNumber.trim() !== asset.serial_number) {
      const duplicate = await prisma.asset.findUnique({
        where: { serial_number: serialNumber.trim() }
      });
      if (duplicate) {
        return res.status(400).json({ message: `Serial Number "${serialNumber}" is already in use by another asset.` });
      }
    }

    let categoryId = asset.category_id;
    if (category) {
      const categoryRecord = await prisma.assetCategory.findUnique({
        where: { category_name: category.trim() }
      });
      if (!categoryRecord) {
        return res.status(400).json({ message: `Selected category "${category}" does not exist.` });
      }
      categoryId = categoryRecord.id;
    }

    let departmentId = asset.department_id;
    if (department) {
      const departmentRecord = await prisma.department.findUnique({
        where: { department_name: department.trim() }
      });
      if (!departmentRecord) {
        return res.status(400).json({ message: `Selected department "${department}" does not exist.` });
      }
      departmentId = departmentRecord.id;
    }

    let imageName = asset.image;
    if (req.file) {
      if (asset.image) {
        const oldPath = path.join(uploadDir, asset.image);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error('Failed to delete old asset image file:', err);
          }
        }
      }
      imageName = req.file.filename;
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: parsedId },
      data: {
        asset_name: assetName ? assetName.trim() : asset.asset_name,
        category_id: categoryId,
        serial_number: serialNumber ? serialNumber.trim() : asset.serial_number,
        purchase_date: purchaseDate ? new Date(purchaseDate) : asset.purchase_date,
        purchase_cost: purchaseCost ? parseFloat(purchaseCost) : asset.purchase_cost,
        condition: condition || asset.condition,
        location: location ? location.trim() : asset.location,
        department_id: departmentId,
        description: description !== undefined ? description.trim() : asset.description,
        image: imageName,
        is_shared: isShared !== undefined ? (isShared === 'true' || isShared === true) : asset.is_shared,
        status: status || asset.status
      }
    });

    return res.status(200).json({
      message: 'Asset details updated successfully.',
      asset: updatedAsset
    });
  } catch (error) {
    console.error('Update Asset Error:', error);
    return res.status(500).json({ message: 'Error updating asset records.' });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid asset ID.' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: parsedId }
    });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    if (asset.status === 'Allocated') {
      return res.status(400).json({ message: 'Delete constraint warning: Allocated assets cannot be removed from database.' });
    }

    if (asset.image) {
      const imagePath = path.join(uploadDir, asset.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error('Failed to delete image file on database deletion:', err);
        }
      }
    }

    await prisma.asset.delete({
      where: { id: parsedId }
    });

    return res.status(200).json({ message: `Asset "${asset.asset_name}" (${asset.asset_tag}) deleted successfully.` });
  } catch (error) {
    console.error('Delete Asset Error:', error);
    return res.status(500).json({ message: 'Error deleting asset record.' });
  }
};

module.exports = {
  upload,
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset
};
