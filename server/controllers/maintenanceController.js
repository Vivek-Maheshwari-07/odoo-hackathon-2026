// server/controllers/maintenanceController.js
// ============================================================
//  AssetFlow ERP — Module 6: Maintenance Controller
//  Uses Prisma ORM and teammate db configuration
// ============================================================

const prisma = require('../config/db');

const sendJson = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, data });
};

// Valid transitions
const VALID_TRANSITIONS = {
  PENDING:             ['APPROVED', 'REJECTED'],
  APPROVED:            ['TECHNICIAN_ASSIGNED', 'REJECTED'],
  TECHNICIAN_ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS:         ['RESOLVED', 'REJECTED'],
  RESOLVED:            [],
  REJECTED:            [],
};

const REQUEST_INCLUDE = {
  asset:      { select: { id: true, asset_name: true, asset_tag: true, location: true, status: true } },
  reporter:   { select: { id: true, full_name: true, email: true } },
  technician: { select: { id: true, full_name: true, email: true } },
  timeline:   { orderBy: { created_at: 'asc' } },
  comments:   { orderBy: { created_at: 'asc' } },
};

// ─────────────────────────────────────────────
//  GET /maintenance
// ─────────────────────────────────────────────
const getAllRequests = async (req, res) => {
  try {
    const { status, priority, assetId, employeeId, search } = req.query;

    const where = {};
    const user = req.user;
    const andFilters = [];

    if (user.role === 'Employee') {
      andFilters.push({ employee_id: user.id });
    } else if (user.role === 'Department Head') {
      const empProfile = await prisma.employee.findUnique({
        where: { user_id: user.id }
      });
      if (empProfile) {
        andFilters.push({
          asset: { department_id: empProfile.department_id }
        });
      }
    }

    if (status)     where.status   = status;
    if (priority)   where.priority = priority;
    if (assetId)    where.asset_id  = parseInt(assetId);
    if (employeeId) where.employee_id = parseInt(employeeId);

    if (search) {
      andFilters.push({
        OR: [
          { issue_title:   { contains: search } },
          { description:  { contains: search } },
          { asset: { asset_name: { contains: search } } },
        ]
      });
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: REQUEST_INCLUDE,
      orderBy: [{ created_at: 'desc' }],
    });

    // Remap response properties for compatibility with frontend code
    const formatted = requests.map(r => ({
      id: r.id,
      assetId: r.asset_id,
      employeeId: r.employee_id,
      technicianId: r.technician_id,
      issueTitle: r.issue_title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      photo: r.photo,
      resolvedAt: r.resolved_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      asset: {
        id: r.asset.id,
        name: r.asset.asset_name,
        assetTag: r.asset.asset_tag,
        location: r.asset.location,
        status: r.asset.status,
      },
      employee: {
        id: r.reporter.id,
        name: r.reporter.full_name,
        email: r.reporter.email,
      },
      technician: r.technician ? {
        id: r.technician.id,
        name: r.technician.full_name,
        email: r.technician.email,
      } : null,
      timeline: r.timeline.map(t => ({
        id: t.id,
        requestId: t.request_id,
        changedById: t.changed_by_id,
        fromStatus: t.from_status,
        toStatus: t.to_status,
        note: t.note,
        createdAt: t.created_at,
      })),
      comments: r.comments.map(c => ({
        id: c.id,
        requestId: c.request_id,
        authorId: c.author_id,
        body: c.body,
        createdAt: c.created_at,
      })),
    }));

    return sendJson(res, 200, true, 'Requests retrieved.', formatted);
  } catch (err) {
    console.error('Error getting requests:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  GET /maintenance/:id
// ─────────────────────────────────────────────
const getRequestById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const r = await prisma.maintenanceRequest.findUnique({
      where:   { id },
      include: REQUEST_INCLUDE,
    });

    if (!r) return sendJson(res, 404, false, 'Request not found.');

    const formatted = {
      id: r.id,
      assetId: r.asset_id,
      employeeId: r.employee_id,
      technicianId: r.technician_id,
      issueTitle: r.issue_title,
      description: r.description,
      priority: r.priority,
      status: r.status,
      photo: r.photo,
      resolvedAt: r.resolved_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      asset: {
        id: r.asset.id,
        name: r.asset.asset_name,
        assetTag: r.asset.asset_tag,
        location: r.asset.location,
        status: r.asset.status,
      },
      employee: {
        id: r.reporter.id,
        name: r.reporter.full_name,
        email: r.reporter.email,
      },
      technician: r.technician ? {
        id: r.technician.id,
        name: r.technician.full_name,
        email: r.technician.email,
      } : null,
      timeline: r.timeline.map(t => ({
        id: t.id,
        requestId: t.request_id,
        changedById: t.changed_by_id,
        fromStatus: t.from_status,
        toStatus: t.to_status,
        note: t.note,
        createdAt: t.created_at,
      })),
      comments: r.comments.map(c => ({
        id: c.id,
        requestId: c.request_id,
        authorId: c.author_id,
        body: c.body,
        createdAt: c.created_at,
      })),
    };

    return sendJson(res, 200, true, 'Request found.', formatted);
  } catch (err) {
    console.error('Error getting request details:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  POST /maintenance
//  Only allocated/available assets can raise maintenance
// ─────────────────────────────────────────────
const createRequest = async (req, res) => {
  try {
    const {
      assetId,
      employeeId,
      issueTitle,
      description,
      priority = 'MEDIUM',
      photo,
    } = req.body;

    if (!assetId || !employeeId || !issueTitle || !description) {
      return sendJson(res, 400, false, 'Missing required fields.');
    }

    const asset = await prisma.asset.findUnique({ where: { id: parseInt(assetId) } });
    if (!asset) return sendJson(res, 404, false, 'Asset not found.');

    // Raise checks
    const existing = await prisma.maintenanceRequest.findFirst({
      where: {
        asset_id: parseInt(assetId),
        status:  { notIn: ['RESOLVED', 'REJECTED'] },
      },
    });
    if (existing) {
      return sendJson(res, 409, false, 'An open maintenance request already exists for this asset.');
    }

    const newRequest = await prisma.maintenanceRequest.create({
      data: {
        asset_id:     parseInt(assetId),
        employee_id:  parseInt(employeeId),
        issue_title:  issueTitle,
        description,
        priority,
        photo:       photo ?? null,
        status:      'PENDING',
      },
    });

    await prisma.maintenanceTimeline.create({
      data: {
        request_id:   newRequest.id,
        changed_by_id: parseInt(employeeId),
        to_status:    'PENDING',
        note:        'Maintenance request raised.',
      },
    });

    return sendJson(res, 201, true, 'Request raised successfully.', newRequest);
  } catch (err) {
    console.error('Error creating request:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  PUT /maintenance/:id/status
//  ⚡ CRITICAL: prisma.$transaction syncs asset status
// ─────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const id     = parseInt(req.params.id);
    const { newStatus, technicianId, note, changedById } = req.body;

    if (!newStatus || !changedById) {
      return sendJson(res, 400, false, 'Missing newStatus or changedById.');
    }

    const request = await prisma.maintenanceRequest.findUnique({
      where:   { id },
      include: { asset: true },
    });
    if (!request) return sendJson(res, 404, false, 'Request not found.');

    const currentStatus = request.status;

    // Check transition
    const allowed = VALID_TRANSITIONS[currentStatus] ?? [];
    if (!allowed.includes(newStatus)) {
      return sendJson(res, 400, false, `Invalid transition: ${currentStatus} -> ${newStatus}.`);
    }

    if (newStatus === 'TECHNICIAN_ASSIGNED' && !technicianId) {
      return sendJson(res, 400, false, 'technicianId is required.');
    }

    const [updated] = await prisma.$transaction(async (tx) => {
      const requestUpdateData = {
        status: newStatus,
        ...(technicianId && { technician_id: parseInt(technicianId) }),
        ...(newStatus === 'RESOLVED' && { resolved_at: new Date() }),
      };

      const updatedReq = await tx.maintenanceRequest.update({
        where: { id },
        data:  requestUpdateData,
      });

      // Asset sync logic:
      // APPROVED -> Under Maintenance
      // RESOLVED -> Available
      let assetStatus = null;
      if (newStatus === 'APPROVED') {
        assetStatus = 'Under Maintenance';
      } else if (newStatus === 'RESOLVED') {
        assetStatus = 'Available';
      } else if (newStatus === 'REJECTED' && request.asset.status === 'Under Maintenance') {
        assetStatus = 'Available';
      }

      if (assetStatus) {
        await tx.asset.update({
          where: { id: request.asset_id },
          data:  { status: assetStatus },
        });
      }

      await tx.maintenanceTimeline.create({
        data: {
          request_id:    id,
          changed_by_id: parseInt(changedById),
          from_status:   currentStatus,
          to_status:     newStatus,
          note:          note ?? null,
        },
      });

      return [updatedReq];
    });

    return sendJson(res, 200, true, 'Status updated.', updated);
  } catch (err) {
    console.error('Error updating status:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  PUT /maintenance/:id
// ─────────────────────────────────────────────
const updateRequest = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { issueTitle, description, priority, photo } = req.body;

    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) return sendJson(res, 404, false, 'Request not found.');

    if (req.user.role !== 'Admin' && req.user.role !== 'Asset Manager' && request.employee_id !== req.user.id) {
      return sendJson(res, 403, false, 'You do not have permission to modify this request.');
    }

    if (request.status !== 'PENDING') {
      return sendJson(res, 409, false, 'Only PENDING requests can be edited.');
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data:  {
        ...(issueTitle   && { issue_title: issueTitle }),
        ...(description  && { description }),
        ...(priority     && { priority }),
        ...(photo        && { photo }),
      },
    });

    return sendJson(res, 200, true, 'Request updated.', updated);
  } catch (err) {
    console.error('Error updating request:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  DELETE /maintenance/:id
// ─────────────────────────────────────────────
const deleteRequest = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const request = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!request) return sendJson(res, 404, false, 'Request not found.');

    if (req.user.role !== 'Admin' && req.user.role !== 'Asset Manager' && request.employee_id !== req.user.id) {
      return sendJson(res, 403, false, 'You do not have permission to delete this request.');
    }

    if (!['PENDING', 'REJECTED'].includes(request.status)) {
      return sendJson(res, 409, false, 'Only PENDING or REJECTED requests can be deleted.');
    }

    await prisma.maintenanceRequest.delete({ where: { id } });
    return sendJson(res, 200, true, 'Request deleted.');
  } catch (err) {
    console.error('Error deleting request:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  GET /maintenance/stats
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    const user = req.user;
    const baseWhere = {};

    if (user.role === 'Employee') {
      baseWhere.employee_id = user.id;
    } else if (user.role === 'Department Head') {
      const empProfile = await prisma.employee.findUnique({
        where: { user_id: user.id }
      });
      if (empProfile) {
        baseWhere.asset = { department_id: empProfile.department_id };
      }
    }

    const [pending, approved, technicianAssigned, inProgress, resolved, rejected] =
      await Promise.all([
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'PENDING' } }),
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'APPROVED' } }),
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'TECHNICIAN_ASSIGNED' } }),
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'IN_PROGRESS' } }),
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'RESOLVED' } }),
        prisma.maintenanceRequest.count({ where: { ...baseWhere, status: 'REJECTED' } }),
      ]);

    return sendJson(res, 200, true, 'Stats retrieved.', {
      pending,
      approved,
      technicianAssigned,
      inProgress,
      resolved,
      rejected,
      total: pending + approved + technicianAssigned + inProgress + resolved + rejected,
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  POST /maintenance/:id/comments
// ─────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { authorId, body } = req.body;

    if (!authorId || !body?.trim()) {
      return sendJson(res, 400, false, 'authorId and body are required.');
    }

    const exists = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!exists) return sendJson(res, 404, false, 'Request not found.');

    const comment = await prisma.maintenanceComment.create({
      data: { request_id: id, author_id: parseInt(authorId), body: body.trim() },
    });

    return sendJson(res, 201, true, 'Comment added.', comment);
  } catch (err) {
    console.error('Error adding comment:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

module.exports = {
  getAllRequests,
  getRequestById,
  createRequest,
  updateStatus,
  updateRequest,
  deleteRequest,
  getStats,
  addComment,
};
