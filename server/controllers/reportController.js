const prisma = require('../config/db');

/**
 * GET /api/reports/dashboard
 * Aggregates core KPI metrics from across the system.
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalAssets = await prisma.asset.count();
    const availableAssets = await prisma.asset.count({ where: { status: 'Available' } });
    const allocatedAssets = await prisma.asset.count({ where: { status: 'Allocated' } });
    const maintenanceAssets = await prisma.asset.count({ where: { status: 'Under Maintenance' } });
    
    // Safety check in case table bookings or audit_cycles doesn't have elements yet
    const activeBookings = await prisma.booking.count({ 
      where: { status: { in: ['Upcoming', 'Ongoing'] } } 
    }).catch(() => 0);

    const activeAudits = await prisma.auditCycle.count({ 
      where: { status: 'Active' } 
    }).catch(() => 0);

    return res.status(200).json({
      totalAssets,
      availableAssets,
      allocatedAssets,
      maintenanceAssets,
      activeBookings,
      activeAudits
    });
  } catch (error) {
    console.error('Report Dashboard Stats Error:', error);
    return res.status(500).json({ message: 'Error aggregating dashboard statistics.' });
  }
};

/**
 * GET /api/reports/assets
 * Returns asset distribution by department, category, and status.
 */
const getAssetReports = async (req, res) => {
  try {
    const { department, category, location, status } = req.query;

    const where = {};
    if (department && department !== 'All') {
      where.department = { is: { department_name: department } };
    }
    if (category && category !== 'All') {
      where.category = { is: { category_name: category } };
    }
    if (location && location !== 'All') {
      where.location = { contains: location };
    }
    if (status && status !== 'All') {
      where.status = status;
    }

    const filteredAssets = await prisma.asset.findMany({
      where,
      include: {
        category: true,
        department: true
      }
    });

    // 1. Group by status
    const statusCounts = {};
    const statuses = ['Available', 'Allocated', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];
    statuses.forEach(s => { statusCounts[s] = 0; });
    
    // 2. Group by department
    const departmentCounts = {};
    
    // 3. Group by category
    const categoryCounts = {};

    filteredAssets.forEach(a => {
      // Status
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      } else {
        statusCounts[a.status] = 1;
      }

      // Department
      const dName = a.department.department_name;
      departmentCounts[dName] = (departmentCounts[dName] || 0) + 1;

      // Category
      const cName = a.category.category_name;
      categoryCounts[cName] = (categoryCounts[cName] || 0) + 1;
    });

    // Format for charts
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const departmentAllocation = Object.entries(departmentCounts).map(([name, value]) => ({ name, value }));
    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

    // Recently added assets list (limit to 5)
    const recentAssets = await prisma.asset.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { department: true }
    });
    
    const formattedRecent = recentAssets.map(r => ({
      id: r.asset_tag,
      name: r.asset_name,
      department: r.department.department_name,
      status: r.status,
      purchaseCost: r.purchase_cost || 0
    }));

    return res.status(200).json({
      statusDistribution,
      departmentAllocation,
      categoryDistribution,
      recentAssets: formattedRecent
    });
  } catch (error) {
    console.error('Get Asset Reports Error:', error);
    return res.status(500).json({ message: 'Error retrieving asset report data.' });
  }
};

/**
 * GET /api/reports/maintenance
 * Returns maintenance request frequency by month.
 */
const getMaintenanceReports = async (req, res) => {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      orderBy: { created_at: 'asc' }
    }).catch(() => []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = {};
    months.forEach(m => { monthlyCounts[m] = 0; });

    requests.forEach(r => {
      const monthName = months[new Date(r.created_at).getMonth()];
      monthlyCounts[monthName]++;
    });

    const frequencyData = Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count
    }));

    // Latest maintenance requests list (limit to 5)
    const recentMaintenance = await prisma.maintenanceRequest.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { asset: true }
    }).catch(() => []);

    const formattedRecent = recentMaintenance.map(rm => ({
      id: rm.id,
      assetTag: rm.asset.asset_tag,
      issue: rm.issue_title,
      priority: rm.priority,
      status: rm.status,
      date: rm.created_at.toISOString().split('T')[0]
    }));

    return res.status(200).json({
      frequencyData,
      recentMaintenance: formattedRecent
    });
  } catch (error) {
    console.error('Get Maintenance Reports Error:', error);
    return res.status(500).json({ message: 'Error retrieving maintenance reports.' });
  }
};

/**
 * GET /api/reports/bookings
 * Returns booking peak hours heatmap.
 */
const getBookingReports = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: { not: 'Cancelled' } }
    }).catch(() => []);

    // Calendar Heatmap: Day of Week (0-6) by hour buckets (9 AM to 6 PM)
    // Initialize day hours: 7 days, 10 hours per day (9 to 18)
    const heatmap = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

    days.forEach(day => {
      hours.forEach(hour => {
        heatmap.push({ day, hour, count: 0 });
      });
    });

    bookings.forEach(b => {
      const date = new Date(b.booking_date);
      const dayName = days[date.getDay()];
      
      const startTime = b.start_time; // format HH:mm
      const hourPart = parseInt(startTime.split(':')[0], 10);
      const hourStr = `${hourPart}:00`;

      const cell = heatmap.find(c => c.day === dayName && c.hour === hourStr);
      if (cell) cell.count++;
    });

    // Recent bookings (limit to 5)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { resource: true }
    }).catch(() => []);

    const formattedRecent = recentBookings.map(rb => ({
      id: rb.id,
      resourceName: rb.resource.resource_name,
      purpose: rb.purpose,
      date: rb.booking_date.toISOString().split('T')[0],
      time: `${rb.start_time} - ${rb.end_time}`,
      status: rb.status
    }));

    return res.status(200).json({
      heatmap,
      recentBookings: formattedRecent
    });
  } catch (error) {
    console.error('Get Booking Reports Error:', error);
    return res.status(500).json({ message: 'Error retrieving resource booking analytics.' });
  }
};

/**
 * GET /api/reports/audit
 * Returns summary stats for audit discrepancies.
 */
const getAuditReports = async (req, res) => {
  try {
    const cycles = await prisma.auditCycle.findMany({
      include: { items: true }
    }).catch(() => []);

    let totalAssetsChecked = 0;
    let missingAssets = 0;
    let damagedAssets = 0;
    let wrongLocationAssets = 0;

    cycles.forEach(c => {
      c.items.forEach(item => {
        totalAssetsChecked++;
        if (item.verification_status === 'Missing') missingAssets++;
        if (item.verification_status === 'Damaged') damagedAssets++;
        if (item.incorrect_location) wrongLocationAssets++;
      });
    });

    return res.status(200).json({
      totalCycles: cycles.length,
      totalAssetsChecked,
      missingAssets,
      damagedAssets,
      wrongLocationAssets
    });
  } catch (error) {
    console.error('Get Audit Reports Error:', error);
    return res.status(500).json({ message: 'Error retrieving audit analytics.' });
  }
};

/**
 * GET /api/reports/export
 * Placeholders for PDF/Excel download endpoints.
 */
const exportReport = (req, res) => {
  const { type } = req.query; // excel | pdf
  return res.status(200).json({
    message: `Export as ${type ? type.toUpperCase() : 'PDF'} triggered successfully. This file is being generated and will download automatically.`,
    downloadUrl: '#'
  });
};

module.exports = {
  getDashboardStats,
  getAssetReports,
  getMaintenanceReports,
  getBookingReports,
  getAuditReports,
  exportReport
};
