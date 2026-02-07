import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  // Remove schema param to connect to default schema (usually public) or just raw connection
  const urlWithoutSchema = dbUrl.replace(/\?schema=.*/, '');
  
  console.log('Connecting to database to reset app_auth schema...');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: urlWithoutSchema,
      },
    },
  });

  try {
    await prisma.$connect();
    // Drop schema if exists
    console.log('Dropping schema app_auth...');
    await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS "app_auth" CASCADE');
    console.log('Schema app_auth dropped.');
    
    // Create schema again? No, migrate dev will do it.
    // But migrate dev expects to create it?
    // Actually migrate dev checks if schema exists. If not, it creates it.
    
  } catch (e) {
    console.error('Error resetting schema:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
