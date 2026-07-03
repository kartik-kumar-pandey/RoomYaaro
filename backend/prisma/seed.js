import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@roomyaaro.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD environment variable is required to seed the admin user. Set it in your .env file.');
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || 'Platform Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user seeded:', adminEmail);
  } else {
    console.log('Admin user already exists');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
