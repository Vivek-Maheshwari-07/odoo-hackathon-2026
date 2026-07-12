// server/controllers/bookingController.js
// ============================================================
//  AssetFlow ERP — Module 5: Resource Booking Controller
//  All CRUD operations + overlap-prevention using Prisma ORM
// ============================================================

const prisma = require('../config/db');

// Helper to send JSON responses
const sendJson = (res, status, success, message, data = null) => {
  return res.status(status).json({ success, message, data });
};

function isValidTimeRange(start, end) {
  return start < end;
}

function isDateNotPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDate = new Date(dateStr);
  return bookingDate >= today;
}

// ─────────────────────────────────────────────
//  GET /bookings
// ─────────────────────────────────────────────
const getAllBookings = async (req, res) => {
  try {
    const { status, resource_type, booking_date, resource_id } = req.query;

    const where = {};
    if (status)        where.status = status;
    if (booking_date)  where.booking_date = new Date(booking_date);
    if (resource_id)   where.resource_id = parseInt(resource_id);
    if (resource_type) {
      where.resource = { resource_type: resource_type };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        resource: true,
        user: { select: { id: true, full_name: true, email: true } },
      },
      orderBy: [
        { booking_date: 'asc' },
        { start_time: 'asc' },
      ],
    });

    // Format fields to match frontend expectations
    const formatted = bookings.map(b => ({
      id: b.id,
      booking_date: b.booking_date,
      start_time: b.start_time,
      end_time: b.end_time,
      purpose: b.purpose,
      notes: b.notes,
      status: b.status,
      created_at: b.created_at,
      resource_id: b.resource_id,
      resource_name: b.resource.resource_name,
      resource_type: b.resource.resource_type,
      location: b.resource.location,
      employee_id: b.employee_id,
      employee_name: b.user.full_name,
    }));

    return sendJson(res, 200, true, 'Bookings retrieved.', formatted);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  GET /bookings/:id
// ─────────────────────────────────────────────
const getBookingById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!booking) return sendJson(res, 404, false, 'Booking not found.');

    const formatted = {
      id: booking.id,
      booking_date: booking.booking_date,
      start_time: booking.start_time,
      end_time: booking.end_time,
      purpose: booking.purpose,
      notes: booking.notes,
      status: booking.status,
      created_at: booking.created_at,
      resource_id: booking.resource_id,
      resource_name: booking.resource.resource_name,
      resource_type: booking.resource.resource_type,
      location: booking.resource.location,
      employee_id: booking.employee_id,
    };

    return sendJson(res, 200, true, 'Booking found.', formatted);
  } catch (err) {
    console.error('Error fetching booking details:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  POST /bookings
//  ⚡ CRITICAL: Overlap prevention using transaction + raw lock
// ─────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const {
      resource_id,
      employee_id,
      booking_date,
      start_time,
      end_time,
      purpose,
      notes,
    } = req.body;

    if (!resource_id || !employee_id || !booking_date || !start_time || !end_time || !purpose) {
      return sendJson(res, 400, false, 'Missing required fields.');
    }

    if (!isDateNotPast(booking_date)) {
      return sendJson(res, 400, false, 'Booking date cannot be in the past.');
    }

    if (!isValidTimeRange(start_time, end_time)) {
      return sendJson(res, 400, false, 'Start time must be earlier than end time.');
    }

    // Check resource status
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(resource_id) },
    });
    if (!resource) return sendJson(res, 404, false, 'Resource not found.');
    if (resource.status !== 'Active') {
      return sendJson(res, 409, false, `Resource is currently ${resource.status} and cannot be booked.`);
    }

    // Atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // Raw lock for MySQL to prevent overlapping bookings
      const formattedDate = booking_date.slice(0, 10);
      const overlap = await tx.$queryRaw`
        SELECT id, start_time, end_time
        FROM bookings
        WHERE resource_id = ${parseInt(resource_id)}
          AND booking_date = ${formattedDate}
          AND status != 'Cancelled'
          AND start_time < ${end_time}
          AND end_time > ${start_time}
        FOR UPDATE
      `;

      if (overlap && overlap.length > 0) {
        throw new Error('OVERLAP');
      }

      // Insert record
      return tx.booking.create({
        data: {
          resource_id: parseInt(resource_id),
          employee_id: parseInt(employee_id),
          booking_date: new Date(booking_date),
          start_time: start_time,
          end_time: end_time,
          purpose,
          notes: notes || null,
          status: 'Upcoming',
        },
      });
    });

    return sendJson(res, 201, true, 'Booking created successfully.', result);
  } catch (err) {
    if (err.message === 'OVERLAP') {
      return sendJson(res, 409, false, 'Resource already booked during this time.');
    }
    console.error('Error creating booking:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  PUT /bookings/:id
// ─────────────────────────────────────────────
const updateBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { booking_date, start_time, end_time, purpose, notes, status } = req.body;

    const existing = await prisma.booking.findUnique({
      where: { id },
    });
    if (!existing) return sendJson(res, 404, false, 'Booking not found.');

    const newDate = booking_date ? new Date(booking_date) : existing.booking_date;
    const newStartTime = start_time || existing.start_time;
    const newEndTime = end_time || existing.end_time;

    if (!isValidTimeRange(newStartTime, newEndTime)) {
      return sendJson(res, 400, false, 'Start time must be earlier than end time.');
    }

    await prisma.$transaction(async (tx) => {
      const formattedDate = newDate.toISOString().slice(0, 10);
      const overlap = await tx.$queryRaw`
        SELECT id
        FROM bookings
        WHERE resource_id = ${existing.resource_id}
          AND booking_date = ${formattedDate}
          AND id != ${id}
          AND status != 'Cancelled'
          AND start_time < ${newEndTime}
          AND end_time > ${newStartTime}
        FOR UPDATE
      `;

      if (overlap && overlap.length > 0) {
        throw new Error('OVERLAP');
      }

      await tx.booking.update({
        where: { id },
        data: {
          booking_date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          purpose: purpose || existing.purpose,
          notes: notes !== undefined ? notes : existing.notes,
          status: status || existing.status,
        },
      });
    });

    return sendJson(res, 200, true, 'Booking updated successfully.');
  } catch (err) {
    if (err.message === 'OVERLAP') {
      return sendJson(res, 409, false, 'Resource already booked during this time.');
    }
    console.error('Error updating booking:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  DELETE /bookings/:id (soft cancel)
// ─────────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return sendJson(res, 404, false, 'Booking not found.');
    if (booking.status === 'Cancelled') {
      return sendJson(res, 409, false, 'Booking is already cancelled.');
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'Cancelled' },
    });

    return sendJson(res, 200, true, 'Booking cancelled successfully.');
  } catch (err) {
    console.error('Error cancelling booking:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  GET /resources
// ─────────────────────────────────────────────
const getAllResources = async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type)   where.resource_type = type;
    if (status) where.status = status;

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { resource_name: 'asc' },
    });

    // Format fields to match frontend expectations
    const formatted = resources.map(r => ({
      id: r.id,
      resource_name: r.resource_name,
      resource_type: r.resource_type,
      location: r.location,
      capacity: r.capacity,
      status: r.status,
      created_at: r.created_at,
    }));

    return sendJson(res, 200, true, 'Resources retrieved.', formatted);
  } catch (err) {
    console.error('Error fetching resources:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  POST /resources
// ─────────────────────────────────────────────
const createResource = async (req, res) => {
  try {
    const { resource_name, resource_type, location, capacity } = req.body;
    if (!resource_name || !resource_type) {
      return sendJson(res, 400, false, 'resource_name and resource_type are required.');
    }

    const result = await prisma.resource.create({
      data: {
        resource_name,
        resource_type,
        location: location || null,
        capacity: capacity ? parseInt(capacity) : null,
      },
    });

    return sendJson(res, 201, true, 'Resource created.', result);
  } catch (err) {
    console.error('Error creating resource:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  PUT /resources/:id
// ─────────────────────────────────────────────
const updateResource = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { resource_name, resource_type, location, capacity, status } = req.body;

    const result = await prisma.resource.update({
      where: { id },
      data: {
        resource_name,
        resource_type,
        location,
        capacity: capacity ? parseInt(capacity) : undefined,
        status,
      },
    });

    return sendJson(res, 200, true, 'Resource updated.', result);
  } catch (err) {
    console.error('Error updating resource:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

// ─────────────────────────────────────────────
//  DELETE /resources/:id
// ─────────────────────────────────────────────
const deleteResource = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.resource.delete({ where: { id } });
    return sendJson(res, 200, true, 'Resource deleted.');
  } catch (err) {
    console.error('Error deleting resource:', err);
    return sendJson(res, 500, false, 'Internal server error.');
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  cancelBooking,
  getAllResources,
  createResource,
  updateResource,
  deleteResource,
};
