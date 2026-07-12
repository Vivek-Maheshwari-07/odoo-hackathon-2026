const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
