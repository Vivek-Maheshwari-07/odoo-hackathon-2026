/**
 * Mock Activity Logs Data
 * Tracks actions performed by users in the AssetFlow ERP system.
 * 
 * Roles: 'Admin', 'Asset Manager', 'Employee', 'Department Head', 'Technician', 'Auditor'
 * Modules: 'System', 'Assets', 'Booking', 'Allocation', 'Maintenance', 'Audit'
 * Statuses: 'Success', 'Failed', 'Pending'
 * 
 * Future API Integration:
 * GET /api/activity-logs -> Returns this list
 */

export const mockActivityLogs = [
  {
    id: 'act-1',
    user: 'Alex Rivera',
    role: 'Admin',
    action: 'created Department (Research & Development)',
    module: 'System',
    date: '2026-07-12',
    time: '11:02 AM',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 'act-2',
    user: 'Marcus Vance',
    role: 'Asset Manager',
    action: 'registered Laptop (MacBook Pro M3 Max - Tag: AST-01024)',
    module: 'Assets',
    date: '2026-07-12',
    time: '10:48 AM',
    ipAddress: '192.168.1.112',
    status: 'Success'
  },
  {
    id: 'act-3',
    user: 'Elena Rostova',
    role: 'Employee',
    action: 'booked Meeting Room (Conference Room B - Reservation: RES-2041)',
    module: 'Booking',
    date: '2026-07-12',
    time: '09:15 AM',
    ipAddress: '10.0.4.52',
    status: 'Success'
  },
  {
    id: 'act-4',
    user: 'Diana Prince',
    role: 'Department Head',
    action: 'approved Transfer (10 Ergonomic Chairs to Logistics Hub)',
    module: 'Allocation',
    date: '2026-07-11',
    time: '04:30 PM',
    ipAddress: '192.168.2.14',
    status: 'Success'
  },
  {
    id: 'act-5',
    user: 'John Doe',
    role: 'Technician',
    action: 'resolved Maintenance (Server Rack A cooling fan replacement)',
    module: 'Maintenance',
    date: '2026-07-11',
    time: '02:20 PM',
    ipAddress: '10.0.12.87',
    status: 'Success'
  },
  {
    id: 'act-6',
    user: 'Sarah Connor',
    role: 'Auditor',
    action: 'completed Audit (Q2 Laptop Check - 142 items verified)',
    module: 'Audit',
    date: '2026-07-11',
    time: '11:15 AM',
    ipAddress: '192.168.10.22',
    status: 'Success'
  },
  {
    id: 'act-7',
    user: 'Alex Rivera',
    role: 'Admin',
    action: 'updated System Security Policies (Password complexity rules)',
    module: 'System',
    date: '2026-07-10',
    time: '05:12 PM',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 'act-8',
    user: 'Marcus Vance',
    role: 'Asset Manager',
    action: 'registered Laptop (Dell Latitude 5440 - Tag: AST-01025)',
    module: 'Assets',
    date: '2026-07-10',
    time: '03:10 PM',
    ipAddress: '192.168.1.112',
    status: 'Success'
  },
  {
    id: 'act-9',
    user: 'Marcus Vance',
    role: 'Asset Manager',
    action: 'attempted bulk import of retired assets',
    module: 'Assets',
    date: '2026-07-10',
    time: '02:55 PM',
    ipAddress: '192.168.1.112',
    status: 'Failed'
  },
  {
    id: 'act-10',
    user: 'Elena Rostova',
    role: 'Employee',
    action: 'booked Meeting Room (Training Lab A - RES-2039)',
    module: 'Booking',
    date: '2026-07-09',
    time: '11:30 AM',
    ipAddress: '10.0.4.52',
    status: 'Success'
  },
  {
    id: 'act-11',
    user: 'Diana Prince',
    role: 'Department Head',
    action: 'denied Transfer Request (MacBook Pro to External Contractor)',
    module: 'Allocation',
    date: '2026-07-09',
    time: '10:05 AM',
    ipAddress: '192.168.2.14',
    status: 'Success'
  },
  {
    id: 'act-12',
    user: 'John Doe',
    role: 'Technician',
    action: 'initiated Maintenance (Routine calibration on 3D Printer #3)',
    module: 'Maintenance',
    date: '2026-07-09',
    time: '08:45 AM',
    ipAddress: '10.0.12.87',
    status: 'Pending'
  },
  {
    id: 'act-13',
    user: 'Sarah Connor',
    role: 'Auditor',
    action: 'started Audit (Storage Room B Hardware Inventory)',
    module: 'Audit',
    date: '2026-07-08',
    time: '02:00 PM',
    ipAddress: '192.168.10.22',
    status: 'Success'
  },
  {
    id: 'act-14',
    user: 'Alex Rivera',
    role: 'Admin',
    action: 'deactivated User Account (Retired staff member: R. Miller)',
    module: 'System',
    date: '2026-07-08',
    time: '09:50 AM',
    ipAddress: '192.168.1.45',
    status: 'Success'
  },
  {
    id: 'act-15',
    user: 'John Doe',
    role: 'Technician',
    action: 'resolved Maintenance (Server UPS battery diagnostic check)',
    module: 'Maintenance',
    date: '2026-07-07',
    time: '03:30 PM',
    ipAddress: '10.0.12.87',
    status: 'Success'
  }
];

export default mockActivityLogs;
