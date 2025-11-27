import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: Role.ADMIN, // assign enum here
      },
    });
    console.log('Admin user created with role ADMIN!');
  } else {
    console.log('Admin already exists!');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
