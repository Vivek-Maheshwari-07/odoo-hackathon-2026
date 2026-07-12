const prisma = require('../server/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('Seeding database...');

  // Create default admin user if not exists
  const adminEmail = 'admin@company.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Password123', 10);
    const admin = await prisma.user.create({
      data: {
        full_name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
        status: 'Active'
      }
    });
    console.log('Admin user seeded successfully:', admin.email);
  } else {
    console.log('Admin user already exists.');
  }

  // Create initial demo departments
  const deptsCount = await prisma.department.count();
  if (deptsCount === 0) {
    await prisma.department.createMany({
      data: [
        { department_name: 'Engineering', status: 'Active' },
        { department_name: 'Design', status: 'Active' },
        { department_name: 'Human Resources', status: 'Inactive' }
      ]
    });
    console.log('Demo departments seeded.');
  }

  // Create initial demo categories
  const catsCount = await prisma.assetCategory.count();
  if (catsCount === 0) {
    await prisma.assetCategory.createMany({
      data: [
        { category_name: 'IT Hardware', description: 'Laptops, monitors, and servers', warranty_period: 3, depreciation_years: 5, status: 'Active' },
        { category_name: 'Office Furniture', description: 'Desks, chairs, and conference tables', warranty_period: 5, depreciation_years: 10, status: 'Active' }
      ]
    });
    console.log('Demo categories seeded.');
  }

  // Create initial demo resources for Module 5
  const resourcesCount = await prisma.resource.count();
  if (resourcesCount === 0) {
    await prisma.resource.createMany({
      data: [
        { resource_name: 'Board Room A',       resource_type: 'Conference Room', location: 'Floor 3, East Wing',  capacity: 20, status: 'Active' },
        { resource_name: 'Meeting Room B1',    resource_type: 'Meeting Room',    location: 'Floor 1, North Wing',  capacity: 8,  status: 'Active' },
        { resource_name: 'Meeting Room B2',    resource_type: 'Meeting Room',    location: 'Floor 1, South Wing',  capacity: 6,  status: 'Active' },
        { resource_name: 'Projector Unit 01',  resource_type: 'Projector',       location: 'AV Storage Room',      capacity: null, status: 'Active' },
        { resource_name: 'Toyota Innova - HR', resource_type: 'Company Vehicle', location: 'Basement Parking',     capacity: null, status: 'Active' },
        { resource_name: 'Dell Laptop Kit',    resource_type: 'Shared Equipment',location: 'IT Dept, Floor 2',     capacity: null, status: 'Active' }
      ]
    });
    console.log('Demo resources seeded.');
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
