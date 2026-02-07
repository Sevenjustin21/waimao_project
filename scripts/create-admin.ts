import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.error('Error: ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log(`Checking admin user: ${email}...`);

  // Ensure connection to DB
  try {
    await prisma.$connect();
  } catch (e) {
    console.error('Failed to connect to DB:', e);
    process.exit(1);
  }

  const existingUser = await prisma.appUser.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('Admin user already exists.');
    return;
  }

  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.appUser.create({
    data: {
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user created successfully: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
