const prisma = require('../config/db');

// =========================================================================
// AUDIT CYCLES CONTROLLER
// =========================================================================

/**
 * GET /api/audit-cycles
 * Retrieves list of all audit cycles.
 */
const getAuditCycles = async (req, res) => {
  try {
    const { status, search } = req.query;

    const where = {};
    if (status && status !== 'All') {
      where.status = status;
    }

    if (search) {
      where.audit_name = { contains: search };
    }

    const cycles = await prisma.auditCycle.findMany({
      where,
      include: {
        department: true,
        creator: true,
        auditors: {
          include: {
            user: true
          }
        },
        items: {
          include: {
            asset: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const result = cycles.map(c => {
      const total = c.items.length;
      const verified = c.items.filter(i => i.verification_status !== 'Pending').length;
      const missing = c.items.filter(i => i.verification_status === 'Missing').length;
      const damaged = c.items.filter(i => i.verification_status === 'Damaged').length;
      const progress = total > 0 ? Math.round((verified / total) * 100) : 0;

      return {
        id: c.id,
        auditName: c.audit_name,
        departmentId: c.department_id,
        departmentName: c.department.department_name,
        startDate: c.start_date.toISOString().split('T')[0],
        endDate: c.end_date.toISOString().split('T')[0],
        status: c.status,
        createdBy: c.creator.full_name,
        createdById: c.created_by,
        createdAt: c.created_at,
        auditors: c.auditors.map(a => ({
          id: a.user.id,
          fullName: a.user.full_name,
          email: a.user.email,
          role: a.user.role
        })),
        stats: {
          total,
          verified,
          missing,
          damaged,
          progress
        }
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Audit Cycles Error:', error);
    return res.status(500).json({ message: 'Error retrieving audit cycles list.' });
  }
};

/**
 * POST /api/audit-cycles
 * Creates a new audit cycle and populates its items with department assets.
 */
const createAuditCycle = async (req, res) => {
  try {
    const { auditName, departmentId, startDate, endDate, auditorIds } = req.body;

    if (!auditName || !departmentId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields for audit cycle creation.' });
    }

    const deptId = parseInt(departmentId, 10);
    if (isNaN(deptId)) {
      return res.status(400).json({ message: 'Invalid department ID.' });
    }

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: deptId }
    });
    if (!department) {
      return res.status(404).json({ message: 'Selected department not found.' });
    }

    // Execute in transaction to ensure consistency
    const newCycle = await prisma.$transaction(async (tx) => {
      // 1. Create audit cycle
      const cycle = await tx.auditCycle.create({
        data: {
          audit_name: auditName.trim(),
          department_id: deptId,
          start_date: new Date(startDate),
          end_date: new Date(endDate),
          status: 'Scheduled',
          created_by: req.user.id
        }
      });

      // 2. Associate auditors
      if (Array.isArray(auditorIds) && auditorIds.length > 0) {
        const auditorData = auditorIds.map(uid => ({
          audit_cycle_id: cycle.id,
          user_id: parseInt(uid, 10)
        }));
        await tx.auditAuditor.createMany({
          data: auditorData
        });
      }

      // 3. Find active assets in this department (excluding Retired/Disposed)
      const assets = await tx.asset.findMany({
        where: {
          department_id: deptId,
          NOT: {
            status: { in: ['Retired', 'Disposed'] }
          }
        }
      });

      // 4. Populate audit items
      if (assets.length > 0) {
        const itemsData = assets.map(asset => ({
          audit_cycle_id: cycle.id,
          asset_id: asset.id,
          verification_status: 'Pending',
          incorrect_location: false
        }));
        await tx.auditItem.createMany({
          data: itemsData
        });
      }

      return cycle;
    });

    return res.status(201).json({
      message: `Audit cycle "${newCycle.audit_name}" created successfully with ${newCycle.id} cycle ID.`,
      auditCycle: newCycle
    });
  } catch (error) {
    console.error('Create Audit Cycle Error:', error);
    return res.status(500).json({ message: 'Error creating audit cycle.' });
  }
};

/**
 * PUT /api/audit-cycles/:id
 * Updates an audit cycle. If status transitions to 'Completed', closes the cycle and updates assets.
 */
const updateAuditCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const { auditName, startDate, endDate, status, auditorIds } = req.body;

    const cycleId = parseInt(id, 10);
    if (isNaN(cycleId)) {
      return res.status(400).json({ message: 'Invalid audit cycle ID.' });
    }

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
      include: { auditors: true, items: true }
    });

    if (!cycle) {
      return res.status(404).json({ message: 'Audit cycle not found.' });
    }

    // Business rule: Closed audits are read-only
    if (cycle.status === 'Completed') {
      return res.status(400).json({ message: 'Closed audits are read-only and cannot be modified.' });
    }

    // Business rule: Only Active audit cycles can be edited (unless we are starting a Scheduled one)
    if (cycle.status !== 'Active' && status !== 'Active' && status !== 'Completed') {
      // If we are modifying standard details of a scheduled cycle, it is allowed.
      if (cycle.status !== 'Scheduled') {
        return res.status(400).json({ message: 'Only active or scheduled audit cycles can be modified.' });
      }
    }

    const updatedCycle = await prisma.$transaction(async (tx) => {
      // 1. Update basic details if supplied
      const updateData = {};
      if (auditName) updateData.audit_name = auditName.trim();
      if (startDate) updateData.start_date = new Date(startDate);
      if (endDate) updateData.end_date = new Date(endDate);
      if (status) updateData.status = status;

      const updated = await tx.auditCycle.update({
        where: { id: cycleId },
        data: updateData
      });

      // 2. Update auditors if modified (delete old, insert new)
      if (Array.isArray(auditorIds)) {
        await tx.auditAuditor.deleteMany({
          where: { audit_cycle_id: cycleId }
        });

        if (auditorIds.length > 0) {
          const auditorData = auditorIds.map(uid => ({
            audit_cycle_id: cycleId,
            user_id: parseInt(uid, 10)
          }));
          await tx.auditAuditor.createMany({
            data: auditorData
          });
        }
      }

      // 3. If closing the cycle (status transitions to Completed), update asset statuses!
      if (status === 'Completed') {
        const auditItems = await tx.auditItem.findMany({
          where: { audit_cycle_id: cycleId }
        });

        for (const item of auditItems) {
          let newAssetStatus = null;

          if (item.verification_status === 'Missing') {
            newAssetStatus = 'Lost'; // Red status badge in front-end
          } else if (item.verification_status === 'Damaged') {
            newAssetStatus = 'Under Maintenance'; // Yellow status badge in front-end
          } else if (item.verification_status === 'Verified') {
            // Restore to Available if it was previously marked lost or under maintenance
            newAssetStatus = 'Available';
          }

          if (newAssetStatus) {
            await tx.asset.update({
              where: { id: item.asset_id },
              data: { status: newAssetStatus }
            });
          }
        }
      }

      return updated;
    });

    return res.status(200).json({
      message: 'Audit cycle updated successfully.',
      auditCycle: updatedCycle
    });
  } catch (error) {
    console.error('Update Audit Cycle Error:', error);
    return res.status(500).json({ message: 'Error updating audit cycle details.' });
  }
};

/**
 * DELETE /api/audit-cycles/:id
 * Deletes an audit cycle (only if not completed).
 */
const deleteAuditCycle = async (req, res) => {
  try {
    const { id } = req.params;
    const cycleId = parseInt(id, 10);
    if (isNaN(cycleId)) {
      return res.status(400).json({ message: 'Invalid audit cycle ID.' });
    }

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId }
    });

    if (!cycle) {
      return res.status(404).json({ message: 'Audit cycle not found.' });
    }

    if (cycle.status === 'Completed') {
      return res.status(400).json({ message: 'Completed audit cycles cannot be deleted.' });
    }

    // Cascade delete is configured on database schema, so deleting the cycle deletes items and auditors
    await prisma.auditCycle.delete({
      where: { id: cycleId }
    });

    return res.status(200).json({ message: `Audit cycle "${cycle.audit_name}" and all associated verifications deleted.` });
  } catch (error) {
    console.error('Delete Audit Cycle Error:', error);
    return res.status(500).json({ message: 'Error deleting audit cycle.' });
  }
};


// =========================================================================
// AUDIT ITEMS CONTROLLER
// =========================================================================

/**
 * GET /api/audit-items
 * Retrieves audit items (optionally filtered by auditCycleId).
 */
const getAuditItems = async (req, res) => {
  try {
    const { auditCycleId } = req.query;

    if (!auditCycleId) {
      return res.status(400).json({ message: 'Query parameter "auditCycleId" is required.' });
    }

    const cycleId = parseInt(auditCycleId, 10);
    if (isNaN(cycleId)) {
      return res.status(400).json({ message: 'Invalid audit cycle ID.' });
    }

    const items = await prisma.auditItem.findMany({
      where: { audit_cycle_id: cycleId },
      include: {
        asset: true,
        verifier: true
      }
    });

    const result = items.map(i => ({
      id: i.id,
      auditCycleId: i.audit_cycle_id,
      assetId: i.asset_id,
      assetTag: i.asset.asset_tag,
      assetName: i.asset.asset_name,
      location: i.asset.location,
      currentStatus: i.asset.status,
      verificationStatus: i.verification_status,
      incorrectLocation: i.incorrect_location,
      comments: i.comments || '',
      verifiedBy: i.verifier ? i.verifier.full_name : null,
      verifiedById: i.verified_by,
      verifiedAt: i.verified_at ? i.verified_at.toISOString().split('T')[0] : null
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get Audit Items Error:', error);
    return res.status(500).json({ message: 'Error retrieving verification assets.' });
  }
};

/**
 * PUT /api/audit-items/:id
 * Updates verification status for a specific item.
 */
const updateAuditItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, comments, incorrectLocation } = req.body;

    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: 'Invalid audit item ID.' });
    }

    const item = await prisma.auditItem.findUnique({
      where: { id: itemId },
      include: { audit_cycle: true }
    });

    if (!item) {
      return res.status(404).json({ message: 'Verification item not found.' });
    }

    // Business rule: Closed audits are read-only
    if (item.audit_cycle.status === 'Completed') {
      return res.status(400).json({ message: 'The parent audit cycle is closed. Asset verification is read-only.' });
    }

    // Business rule: Audit items can only be updated if the cycle is Active
    if (item.audit_cycle.status !== 'Active') {
      return res.status(400).json({ message: 'Asset verification can only be performed on Active audit cycles.' });
    }

    const updated = await prisma.auditItem.update({
      where: { id: itemId },
      data: {
        verification_status: verificationStatus,
        comments: comments !== undefined ? comments.trim() : item.comments,
        incorrect_location: incorrectLocation !== undefined ? incorrectLocation : item.incorrect_location,
        verified_by: req.user.id,
        verified_at: new Date()
      }
    });

    return res.status(200).json({
      message: 'Asset verification updated successfully.',
      auditItem: updated
    });
  } catch (error) {
    console.error('Update Audit Item Error:', error);
    return res.status(500).json({ message: 'Error updating asset verification records.' });
  }
};

/**
 * POST /api/audit-items
 * Adds a new asset to an existing audit cycle manually (optional helper endpoint).
 */
const createAuditItem = async (req, res) => {
  try {
    const { auditCycleId, assetId } = req.body;

    if (!auditCycleId || !assetId) {
      return res.status(400).json({ message: 'Missing required parameters: auditCycleId, assetId.' });
    }

    const cycleId = parseInt(auditCycleId, 10);
    const astId = parseInt(assetId, 10);

    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId }
    });
    if (!cycle) {
      return res.status(404).json({ message: 'Audit cycle not found.' });
    }
    if (cycle.status === 'Completed') {
      return res.status(400).json({ message: 'Audit cycle is closed.' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: astId }
    });
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found.' });
    }

    // Check duplicate
    const duplicate = await prisma.auditItem.findFirst({
      where: { audit_cycle_id: cycleId, asset_id: astId }
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Asset is already added to this audit cycle.' });
    }

    const newItem = await prisma.auditItem.create({
      data: {
        audit_cycle_id: cycleId,
        asset_id: astId,
        verification_status: 'Pending',
        incorrect_location: false
      }
    });

    return res.status(201).json({
      message: 'Asset added to audit cycle successfully.',
      auditItem: newItem
    });
  } catch (error) {
    console.error('Create Audit Item Error:', error);
    return res.status(500).json({ message: 'Error adding asset to audit cycle.' });
  }
};

module.exports = {
  getAuditCycles,
  createAuditCycle,
  updateAuditCycle,
  deleteAuditCycle,
  getAuditItems,
  updateAuditItem,
  createAuditItem
};
