const prisma = require('../server/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 1. Seed Departments
  const deptNames = [
    'Administration',
    'Engineering',
    'Human Resources',
    'Finance',
    'Operations',
    'IT Support'
  ];
  const depts = {};
  for (const name of deptNames) {
    let dept = await prisma.department.findUnique({
      where: { department_name: name }
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: { department_name: name, status: 'Active' }
      });
    }
    depts[name] = dept;
  }
  console.log('Departments seeded successfully.');

  // 2. Seed Asset Categories
  const catNames = [
    'Electronics',
    'Furniture',
    'Vehicles',
    'Networking',
    'Office Equipment',
    'Laboratory Equipment'
  ];
  const cats = {};
  for (const name of catNames) {
    let cat = await prisma.assetCategory.findUnique({
      where: { category_name: name }
    });
    if (!cat) {
      cat = await prisma.assetCategory.create({
        data: {
          category_name: name,
          description: `Asset category for ${name}`,
          warranty_period: 3,
          depreciation_years: 5,
          status: 'Active'
        }
      });
    }
    cats[name] = cat;
  }
  console.log('Categories seeded successfully.');

  // 3. Seed Users
  const userData = [
    {
      fullName: 'Vivek Maheshwari',
      email: 'admin@assetflow.com',
      role: 'Admin',
      department: 'Administration'
    },
    {
      fullName: 'Rahul Sharma',
      email: 'manager@assetflow.com',
      role: 'Asset Manager',
      department: 'Operations'
    },
    {
      fullName: 'Priya Patel',
      email: 'head@assetflow.com',
      role: 'Department Head',
      department: 'Engineering'
    },
    {
      fullName: 'Aman Verma',
      email: 'aman@assetflow.com',
      role: 'Employee',
      department: 'Engineering'
    },
    {
      fullName: 'Sneha Shah',
      email: 'sneha@assetflow.com',
      role: 'Employee',
      department: 'Human Resources'
    },
    {
      fullName: 'Rohit Mehta',
      email: 'rohit@assetflow.com',
      role: 'Employee',
      department: 'Finance'
    }
  ];

  const users = {};
  for (const u of userData) {
    let user = await prisma.user.findUnique({
      where: { email: u.email }
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          full_name: u.fullName,
          email: u.email,
          password: passwordHash,
          role: u.role,
          status: 'Active'
        }
      });
    }
    users[u.email] = user;
  }
  console.log('Users seeded successfully.');

  // 4. Seed Employee Records (for Employee/Head roles)
  const employeeData = [
    {
      email: 'head@assetflow.com',
      code: 'EMP-001',
      designation: 'VP Engineering',
      deptName: 'Engineering',
      phone: '9876543210'
    },
    {
      email: 'aman@assetflow.com',
      code: 'EMP-002',
      designation: 'Software Engineer',
      deptName: 'Engineering',
      phone: '9876543211'
    },
    {
      email: 'sneha@assetflow.com',
      code: 'EMP-003',
      designation: 'HR Executive',
      deptName: 'Human Resources',
      phone: '9876543212'
    },
    {
      email: 'rohit@assetflow.com',
      code: 'EMP-004',
      designation: 'Finance Associate',
      deptName: 'Finance',
      phone: '9876543213'
    },
    {
      email: 'manager@assetflow.com',
      code: 'EMP-005',
      designation: 'Operations Lead',
      deptName: 'Operations',
      phone: '9876543214'
    }
  ];

  const employees = {};
  for (const emp of employeeData) {
    const user = users[emp.email];
    if (!user) continue;

    let dbEmp = await prisma.employee.findUnique({
      where: { user_id: user.id }
    });
    if (!dbEmp) {
      dbEmp = await prisma.employee.create({
        data: {
          user_id: user.id,
          department_id: depts[emp.deptName].id,
          employee_code: emp.code,
          designation: emp.designation,
          phone: emp.phone,
          status: 'Active'
        }
      });
    }
    employees[emp.email] = dbEmp;
  }
  console.log('Employees records seeded.');

  // 5. Seed Assets (28 assets)
  const assetsData = [
    { tag: 'AST-001', name: 'Dell Latitude 5440', cat: 'Electronics', serial: 'SN-DELL-5440-01', cost: 1200, cond: 'New', loc: 'Room 302, Floor 3', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-002', name: 'Dell Latitude 5440', cat: 'Electronics', serial: 'SN-DELL-5440-02', cost: 1200, cond: 'Good', loc: 'Room 302, Floor 3', dept: 'Engineering', status: 'Allocated' },
    { tag: 'AST-003', name: 'MacBook Pro 16 M3', cat: 'Electronics', serial: 'SN-MAC-M3-01', cost: 2500, cond: 'New', loc: 'HQ, Floor 4', dept: 'Engineering', status: 'Allocated' },
    { tag: 'AST-004', name: 'MacBook Pro 14 M3', cat: 'Electronics', serial: 'SN-MAC-M3-02', cost: 2000, cond: 'Good', loc: 'HQ, Floor 4', dept: 'Operations', status: 'Allocated' },
    { tag: 'AST-005', name: 'HP LaserJet Pro Printer', cat: 'Office Equipment', serial: 'SN-HP-LJ-01', cost: 450, cond: 'Fair', loc: 'Reception desk', dept: 'Administration', status: 'Available' },
    { tag: 'AST-006', name: 'HP LaserJet Pro Printer', cat: 'Office Equipment', serial: 'SN-HP-LJ-02', cost: 450, cond: 'Good', loc: 'Finance cabinet room', dept: 'Finance', status: 'Available' },
    { tag: 'AST-007', name: 'Epson Projector 4K', cat: 'Office Equipment', serial: 'SN-EPSON-4K-01', cost: 900, cond: 'Good', loc: 'AV storage cupboard', dept: 'Administration', status: 'Reserved' },
    { tag: 'AST-008', name: 'Conference Room Display 65"', cat: 'Office Equipment', serial: 'SN-LG-DISP-01', cost: 1300, cond: 'Good', loc: 'Board Room A', dept: 'Administration', status: 'Available' },
    { tag: 'AST-009', name: 'Ergonomic Office Chair', cat: 'Furniture', serial: 'SN-CHAIR-ERG-01', cost: 350, cond: 'Good', loc: 'Room 201, Floor 2', dept: 'Human Resources', status: 'Allocated' },
    { tag: 'AST-010', name: 'Ergonomic Office Chair', cat: 'Furniture', serial: 'SN-CHAIR-ERG-02', cost: 350, cond: 'Good', loc: 'Room 201, Floor 2', dept: 'Human Resources', status: 'Available' },
    { tag: 'AST-011', name: 'Standing Desk Pro', cat: 'Furniture', serial: 'SN-DESK-STND-01', cost: 600, cond: 'New', loc: 'HQ, Floor 2', dept: 'Finance', status: 'Allocated' },
    { tag: 'AST-012', name: 'Standing Desk Pro', cat: 'Furniture', serial: 'SN-DESK-STND-02', cost: 600, cond: 'New', loc: 'HQ, Floor 2', dept: 'Finance', status: 'Available' },
    { tag: 'AST-013', name: 'Toyota Innova Crysta', cat: 'Vehicles', serial: 'SN-TOYOTA-IN-01', cost: 32000, cond: 'Good', loc: 'Basement Parking #04', dept: 'Administration', status: 'Available' },
    { tag: 'AST-014', name: 'Honda Activa 6G', cat: 'Vehicles', serial: 'SN-HONDA-AC-01', cost: 1500, cond: 'Good', loc: 'Basement Parking #10', dept: 'Operations', status: 'Available' },
    { tag: 'AST-015', name: 'Cisco Catalyst 9300 Switch', cat: 'Networking', serial: 'SN-CISCO-SW-01', cost: 2200, cond: 'New', loc: 'Server Room Floor 3', dept: 'IT Support', status: 'Available' },
    { tag: 'AST-016', name: 'Cisco Catalyst 9300 Switch', cat: 'Networking', serial: 'SN-CISCO-SW-02', cost: 2200, cond: 'Under Repair', loc: 'Server Room Floor 3', dept: 'IT Support', status: 'Under Maintenance' },
    { tag: 'AST-017', name: 'APC Server Rack 42U', cat: 'Networking', serial: 'SN-APC-RACK-01', cost: 1800, cond: 'Good', loc: 'Server Room Floor 3', dept: 'IT Support', status: 'Available' },
    { tag: 'AST-018', name: 'Lenovo ThinkCentre PC', cat: 'Electronics', serial: 'SN-LEN-THINK-01', cost: 800, cond: 'Fair', loc: 'Operations Lab 1', dept: 'Operations', status: 'Available' },
    { tag: 'AST-019', name: 'Lenovo ThinkCentre PC', cat: 'Electronics', serial: 'SN-LEN-THINK-02', cost: 800, cond: 'Good', loc: 'Operations Lab 1', dept: 'Operations', status: 'Available' },
    { tag: 'AST-020', name: 'Zebra Barcode Scanner', cat: 'Office Equipment', serial: 'SN-ZEB-SCAN-01', cost: 250, cond: 'Good', loc: 'Stock Warehouse', dept: 'Operations', status: 'Available' },
    { tag: 'AST-021', name: 'Dell UltraSharp 27 Monitor', cat: 'Electronics', serial: 'SN-DELL-MON-01', cost: 400, cond: 'Good', loc: 'Room 302, Floor 3', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-022', name: 'Dell UltraSharp 27 Monitor', cat: 'Electronics', serial: 'SN-DELL-MON-02', cost: 400, cond: 'Good', loc: 'Room 302, Floor 3', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-023', name: 'Sony 65-inch Meeting Room TV', cat: 'Office Equipment', serial: 'SN-SONY-TV-01', cost: 1100, cond: 'Good', loc: 'Meeting Room B1', dept: 'Administration', status: 'Available' },
    { tag: 'AST-024', name: 'Spectrophotometer LabPro', cat: 'Laboratory Equipment', serial: 'SN-LAB-SPEC-01', cost: 8500, cond: 'Good', loc: 'Engineering Lab 2', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-025', name: 'Digital Microscope Zoom', cat: 'Laboratory Equipment', serial: 'SN-LAB-MIC-01', cost: 3500, cond: 'Good', loc: 'Engineering Lab 2', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-026', name: 'Centrifuge SpinMax', cat: 'Laboratory Equipment', serial: 'SN-LAB-CENT-01', cost: 4200, cond: 'Good', loc: 'Engineering Lab 2', dept: 'Engineering', status: 'Available' },
    { tag: 'AST-027', name: 'Conference Table Oak', cat: 'Furniture', serial: 'SN-CONF-TAB-01', cost: 2000, cond: 'Good', loc: 'Board Room A', dept: 'Administration', status: 'Available' },
    { tag: 'AST-028', name: 'Logitech Rally Bar Video System', cat: 'Office Equipment', serial: 'SN-LOGI-RAL-01', cost: 2400, cond: 'Good', loc: 'Board Room A', dept: 'Administration', status: 'Lost' },
    { tag: 'AST-029', name: 'ThinkPad Classic Laptop', cat: 'Electronics', serial: 'SN-THINK-CLASS-01', cost: 950, cond: 'Poor', loc: 'IT Scrap Area', dept: 'IT Support', status: 'Retired' }
  ];

  const assets = {};
  for (const ast of assetsData) {
    let dbAst = await prisma.asset.findUnique({
      where: { asset_tag: ast.tag }
    });
    if (!dbAst) {
      dbAst = await prisma.asset.create({
        data: {
          asset_tag: ast.tag,
          asset_name: ast.name,
          category_id: cats[ast.cat].id,
          serial_number: ast.serial,
          purchase_date: new Date('2025-01-10T00:00:00Z'),
          purchase_cost: ast.cost,
          condition: ast.cond,
          location: ast.loc,
          department_id: depts[ast.dept].id,
          is_shared: false,
          status: ast.status
        }
      });
    }
    assets[ast.tag] = dbAst;
  }
  console.log('Assets seeded successfully.');

  // 6. Seed Allocations
  // Let's allocate AST-002, AST-003, AST-004, AST-009, AST-011 to employees
  const allocationsData = [
    { tag: 'AST-002', email: 'aman@assetflow.com', dept: 'Engineering' },
    { tag: 'AST-003', email: 'head@assetflow.com', dept: 'Engineering' },
    { tag: 'AST-004', email: 'manager@assetflow.com', dept: 'Operations' },
    { tag: 'AST-009', email: 'sneha@assetflow.com', dept: 'Human Resources' },
    { tag: 'AST-011', email: 'rohit@assetflow.com', dept: 'Finance' }
  ];

  for (const alloc of allocationsData) {
    const asset = assets[alloc.tag];
    const employee = employees[alloc.email];
    if (!asset || !employee) continue;

    const count = await prisma.assetAllocation.count({
      where: { asset_id: asset.id, employee_id: employee.id, status: 'Active' }
    });
    if (count === 0) {
      await prisma.assetAllocation.create({
        data: {
          asset_id: asset.id,
          employee_id: employee.id,
          department_id: depts[alloc.dept].id,
          allocated_by: users['admin@assetflow.com'].id,
          allocation_date: new Date('2026-06-01T00:00:00Z'),
          expected_return_date: new Date('2026-08-01T00:00:00Z'),
          status: 'Active',
          purpose: 'Deployment for operational responsibilities.'
        }
      });
    }
  }
  console.log('Asset allocations seeded successfully.');

  // 7. Seed Resources for Booking
  const resourcesData = [
    { name: 'Board Room A', type: 'Conference Room', loc: 'Floor 3, East Wing', cap: 20 },
    { name: 'Meeting Room B1', type: 'Meeting Room', loc: 'Floor 1, North Wing', cap: 8 },
    { name: 'Conference Hall C', type: 'Conference Hall', loc: 'Ground Floor', cap: 100 },
    { name: 'Projector Unit 01', type: 'Projector', loc: 'AV Storage Room', cap: null },
    { name: 'Toyota Innova - HR', type: 'Company Vehicle', loc: 'Basement Parking', cap: null }
  ];

  const resources = {};
  for (const r of resourcesData) {
    let dbRes = await prisma.resource.findFirst({
      where: { resource_name: r.name }
    });
    if (!dbRes) {
      dbRes = await prisma.resource.create({
        data: {
          resource_name: r.name,
          resource_type: r.type,
          location: r.loc,
          capacity: r.cap,
          status: 'Active'
        }
      });
    }
    resources[r.name] = dbRes;
  }
  console.log('Resources for bookings seeded.');

  // 8. Seed Bookings (Upcoming, Completed, Cancelled)
  const bookingsData = [
    { res: 'Board Room A', email: 'head@assetflow.com', date: '2026-07-15T00:00:00Z', start: '10:00', end: '12:00', purpose: 'Q3 Technology Review Planning Session', status: 'Upcoming' },
    { res: 'Meeting Room B1', email: 'aman@assetflow.com', date: '2026-07-12T00:00:00Z', start: '14:00', end: '15:00', purpose: 'Developer Standup & Backlog Grooming', status: 'Ongoing' },
    { res: 'Toyota Innova - HR', email: 'sneha@assetflow.com', date: '2026-07-10T00:00:00Z', start: '09:00', end: '17:00', purpose: 'Offsite recruitment drive transport support', status: 'Completed' },
    { res: 'Conference Hall C', email: 'manager@assetflow.com', date: '2026-07-11T00:00:00Z', start: '11:00', end: '13:00', purpose: 'Operations Townhall Conference', status: 'Cancelled' }
  ];

  for (const b of bookingsData) {
    const resource = resources[b.res];
    const user = users[b.email];
    if (!resource || !user) continue;

    const count = await prisma.booking.count({
      where: {
        resource_id: resource.id,
        booking_date: new Date(b.date),
        start_time: b.start,
        end_time: b.end
      }
    });

    if (count === 0) {
      await prisma.booking.create({
        data: {
          resource_id: resource.id,
          employee_id: user.id,
          booking_date: new Date(b.date),
          start_time: b.start,
          end_time: b.end,
          purpose: b.purpose,
          status: b.status
        }
      });
    }
  }
  console.log('Bookings seeded.');

  // 9. Seed Maintenance Requests
  const maintData = [
    { tag: 'AST-016', email: 'aman@assetflow.com', tech: 'admin@assetflow.com', title: 'Power supply failure', desc: 'The switch fan is making a loud noise and it is intermittently turning off.', prio: 'High', status: 'In Progress' },
    { tag: 'AST-005', email: 'rohit@assetflow.com', tech: 'manager@assetflow.com', title: 'Paper jam and rollers issue', desc: 'Paper constantly jams in tray 2 and prints are smeared with black streaks.', prio: 'Medium', status: 'Approved' },
    { tag: 'AST-021', email: 'head@assetflow.com', tech: null, title: 'Flickering screen on HDMI input', desc: 'Display flickers constantly when plugged into laptops using the HDMI port.', prio: 'Low', status: 'Pending' },
    { tag: 'AST-003', email: 'head@assetflow.com', tech: 'admin@assetflow.com', title: 'Keyboard key replacement', desc: 'Spacebar and Shift key are loose, keyboard needs physical key replacements.', prio: 'Low', status: 'Resolved' }
  ];

  for (const m of maintData) {
    const asset = assets[m.tag];
    const reporter = users[m.email];
    const techUser = m.tech ? users[m.tech] : null;
    if (!asset || !reporter) continue;

    const count = await prisma.maintenanceRequest.count({
      where: { asset_id: asset.id, issue_title: m.title }
    });

    if (count === 0) {
      const dbReq = await prisma.maintenanceRequest.create({
        data: {
          asset_id: asset.id,
          employee_id: reporter.id,
          technician_id: techUser ? techUser.id : null,
          issue_title: m.title,
          description: m.desc,
          priority: m.prio,
          status: m.status,
          resolved_at: m.status === 'Resolved' ? new Date() : null
        }
      });

      // Add timeline
      await prisma.maintenanceTimeline.create({
        data: {
          request_id: dbReq.id,
          changed_by_id: reporter.id,
          from_status: null,
          to_status: 'Pending',
          note: 'Maintenance ticket created successfully.'
        }
      });

      if (m.status !== 'Pending') {
        await prisma.maintenanceTimeline.create({
          data: {
            request_id: dbReq.id,
            changed_by_id: users['admin@assetflow.com'].id,
            from_status: 'Pending',
            to_status: m.status,
            note: `Status updated to ${m.status}`
          }
        });
      }
    }
  }
  console.log('Maintenance requests seeded.');

  // 10. Seed Audits
  // Completed Audit for Finance
  let completedAudit = await prisma.auditCycle.findFirst({
    where: { audit_name: 'Q2 Finance Inventory Audit' }
  });
  if (!completedAudit) {
    completedAudit = await prisma.auditCycle.create({
      data: {
        audit_name: 'Q2 Finance Inventory Audit',
        department_id: depts['Finance'].id,
        start_date: new Date('2026-04-01T00:00:00Z'),
        end_date: new Date('2026-04-10T00:00:00Z'),
        status: 'Completed',
        created_by: users['admin@assetflow.com'].id
      }
    });

    // Add items for Q2 audit (standing desks AST-011 and AST-012)
    await prisma.auditItem.createMany({
      data: [
        {
          audit_cycle_id: completedAudit.id,
          asset_id: assets['AST-011'].id,
          verification_status: 'Verified',
          comments: 'Physical condition is good and tag is intact.',
          verified_by: users['admin@assetflow.com'].id,
          verified_at: new Date('2026-04-05T10:00:00Z')
        },
        {
          audit_cycle_id: completedAudit.id,
          asset_id: assets['AST-012'].id,
          verification_status: 'Damaged',
          comments: 'Standing desk hydraulic motor is sluggish and needs checking.',
          verified_by: users['admin@assetflow.com'].id,
          verified_at: new Date('2026-04-05T10:30:00Z')
        }
      ]
    });
  }

  // Active Audit for Engineering
  let activeAudit = await prisma.auditCycle.findFirst({
    where: { audit_name: 'Q3 Engineering Physical Audit' }
  });
  if (!activeAudit) {
    activeAudit = await prisma.auditCycle.create({
      data: {
        audit_name: 'Q3 Engineering Physical Audit',
        department_id: depts['Engineering'].id,
        start_date: new Date('2026-07-01T00:00:00Z'),
        end_date: new Date('2026-07-20T00:00:00Z'),
        status: 'Active',
        created_by: users['admin@assetflow.com'].id
      }
    });

    // Add items for Q3 audit (Dell AST-001, AST-002, MacBook AST-003)
    await prisma.auditItem.createMany({
      data: [
        {
          audit_cycle_id: activeAudit.id,
          asset_id: assets['AST-001'].id,
          verification_status: 'Verified',
          comments: 'Verified in the lab room 302.',
          verified_by: users['manager@assetflow.com'].id,
          verified_at: new Date()
        },
        {
          audit_cycle_id: activeAudit.id,
          asset_id: assets['AST-002'].id,
          verification_status: 'Pending',
          comments: null
        },
        {
          audit_cycle_id: activeAudit.id,
          asset_id: assets['AST-003'].id,
          verification_status: 'Missing',
          comments: 'Asset was not found in physical check.',
          verified_by: users['manager@assetflow.com'].id,
          verified_at: new Date()
        }
      ]
    });

    // Link auditor
    await prisma.auditAuditor.upsert({
      where: {
        audit_cycle_id_user_id: {
          audit_cycle_id: activeAudit.id,
          user_id: users['manager@assetflow.com'].id
        }
      },
      update: {},
      create: {
        audit_cycle_id: activeAudit.id,
        user_id: users['manager@assetflow.com'].id
      }
    });
  }
  console.log('Audits seeded successfully.');
  console.log('MySQL Seeding Process completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
