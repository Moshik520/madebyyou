import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Did you create apps/api/.env?');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
