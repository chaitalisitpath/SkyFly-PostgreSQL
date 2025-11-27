import { PrismaService } from './prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  // 1️⃣ Use PrismaService with adapter
  const prisma = new PrismaService();
  await prisma.$connect();

  try {
    const email = 'admin@example.com';

    // 2️⃣ Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('Admin already exists');
      return;
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // 4️⃣ Create admin user with role ADMIN
    await prisma.user.create({
      data: {
        name: 'Admin',
        email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    console.log('✅ Admin user seeded successfully');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    // 5️⃣ Disconnect Prisma
    await prisma.$disconnect();
  }
}

// Run the seed
main();
