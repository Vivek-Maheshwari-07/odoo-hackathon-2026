/**
 * Mock Notifications Data
 * Represents events and alerts within the AssetFlow ERP system.
 * 
 * Categories: 'System', 'Maintenance', 'Booking', 'Audit', 'Allocation'
 * Priorities: 'Low', 'Medium', 'High', 'Critical'
 * Statuses: 'Read', 'Unread'
 * 
 * Future API Integration:
 * GET /api/notifications -> Returns this list
 * PUT /api/notifications/:id/read -> Updates read status
 * PUT /api/notifications/read-all -> Marks all notifications as read
 * DELETE /api/notifications/:id -> Deletes a notification
 */

export const mockNotifications = [
  {
    id: 'notif-1',
    type: 'Asset Assigned',
    category: 'Allocation',
    title: 'MacBook Pro 16" Assigned',
    description: 'MacBook Pro 16" (Asset Tag: AST-00249) has been successfully assigned to Sarah Jenkins (Engineering).',
    priority: 'Low',
    status: 'Unread',
    date: '2026-07-12',
    time: '11:15 AM'
  },
  {
    id: 'notif-2',
    type: 'Overdue Return',
    category: 'Allocation',
    title: 'Overdue Return: iPad Pro',
    description: 'iPad Pro (Asset Tag: AST-00892) assigned to David Lee was scheduled to be returned on 2026-07-10.',
    priority: 'High',
    status: 'Unread',
    date: '2026-07-12',
    time: '09:30 AM'
  },
  {
    id: 'notif-3',
    type: 'Maintenance Approved',
    category: 'Maintenance',
    title: 'Maintenance Request Approved: Dell Server Rack B',
    description: 'The scheduled replacement of cooling fans for Server Rack B has been approved. Est. cost: $450.',
    priority: 'Medium',
    status: 'Read',
    date: '2026-07-12',
    time: '08:45 AM'
  },
  {
    id: 'notif-4',
    type: 'Audit Discrepancy Found',
    category: 'Audit',
    title: 'Audit Discrepancy: Q3 IT Inventory',
    description: 'A mismatch of 3 monitors was discovered during the Q3 IT physical inventory check in Room 402.',
    priority: 'Critical',
    status: 'Unread',
    date: '2026-07-11',
    time: '04:20 PM'
  },
  {
    id: 'notif-5',
    type: 'Booking Confirmed',
    category: 'Booking',
    title: 'Conference Room C Booking Confirmed',
    description: 'Booking reservation confirmation for Project Review from 2:00 PM to 4:00 PM on 2026-07-15.',
    priority: 'Low',
    status: 'Read',
    date: '2026-07-11',
    time: '02:10 PM'
  },
  {
    id: 'notif-6',
    type: 'Asset Lost',
    category: 'System',
    title: 'Critical Report: Lenovo ThinkPad Lost',
    description: 'Lenovo ThinkPad Carbon X1 (Asset Tag: AST-00512) has been reported as lost by Mark Spencer.',
    priority: 'Critical',
    status: 'Unread',
    date: '2026-07-11',
    time: '11:05 AM'
  },
  {
    id: 'notif-7',
    type: 'Transfer Approved',
    category: 'Allocation',
    title: 'Asset Transfer Approved',
    description: 'Transfer of 5 Designer Chairs from HQ Office to Branch Office A has been approved by Logistics.',
    priority: 'Medium',
    status: 'Unread',
    date: '2026-07-10',
    time: '03:40 PM'
  },
  {
    id: 'notif-8',
    type: 'Maintenance Completed',
    category: 'Maintenance',
    title: 'Maintenance Completed: Projector 3A',
    description: 'Technician resolved maintenance for Projector 3A (Bulb replacement and alignment). Asset status set to Available.',
    priority: 'Low',
    status: 'Read',
    date: '2026-07-10',
    time: '01:15 PM'
  },
  {
    id: 'notif-9',
    type: 'Audit Started',
    category: 'Audit',
    title: 'Audit Cycle Initialized',
    description: 'Annual FY26 Q3 Asset Audit has been officially started. All managers must complete local checklists.',
    priority: 'Medium',
    status: 'Read',
    date: '2026-07-09',
    time: '09:00 AM'
  },
  {
    id: 'notif-10',
    type: 'Booking Cancelled',
    category: 'Booking',
    title: 'Resource Booking Cancelled: Training Hall B',
    description: 'Booking reservation for Training Hall B on 2026-07-14 was cancelled by HR Department.',
    priority: 'Low',
    status: 'Unread',
    date: '2026-07-09',
    time: '08:30 AM'
  },
  {
    id: 'notif-11',
    type: 'Asset Returned',
    category: 'Allocation',
    title: 'Asset Returned: DSLR Camera Kit',
    description: 'Canon DSLR Kit (Asset Tag: AST-00120) has been returned in good condition by Marketing.',
    priority: 'Low',
    status: 'Read',
    date: '2026-07-08',
    time: '05:10 PM'
  },
  {
    id: 'notif-12',
    type: 'Audit Completed',
    category: 'Audit',
    title: 'Audit Complete: Finance Department',
    description: 'Q3 Financial hardware audit concluded. 100% compliance recorded. No anomalies found.',
    priority: 'Low',
    status: 'Read',
    date: '2026-07-08',
    time: '03:15 PM'
  },
  {
    id: 'notif-13',
    type: 'Asset Assigned',
    category: 'Allocation',
    title: 'New Assignment: DJI Mavic Drone',
    description: 'DJI Mavic Pro (Asset Tag: AST-00991) assigned to Creative Team for site survey.',
    priority: 'Medium',
    status: 'Unread',
    date: '2026-07-08',
    time: '10:00 AM'
  },
  {
    id: 'notif-14',
    type: 'Overdue Return',
    category: 'Allocation',
    title: 'Overdue Return: 3D Printer v2',
    description: 'Ultimaker 3D Printer (Asset Tag: AST-00431) has exceeded its scheduled return date by 3 days.',
    priority: 'High',
    status: 'Read',
    date: '2026-07-07',
    time: '04:00 PM'
  },
  {
    id: 'notif-15',
    type: 'Maintenance Approved',
    category: 'Maintenance',
    title: 'Critical Maintenance Approved: UPS Battery Backup',
    description: 'Emergency replacement of battery packs in Main Server UPS room has been approved and scheduled.',
    priority: 'High',
    status: 'Unread',
    date: '2026-07-07',
    time: '11:30 AM'
  }
];

export default mockNotifications;
