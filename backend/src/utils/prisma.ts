import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  if (host && user && dbName) {
    const encodedUser = encodeURIComponent(user);
    const encodedPassword = password ? `:${encodeURIComponent(password)}` : "";
    process.env.DATABASE_URL = `postgresql://${encodedUser}${encodedPassword}@${host}:${port}/${dbName}?schema=public`;
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
