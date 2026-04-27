import prisma from '../utils/prisma.js';

/**
 * Initializes the connection to the PostgreSQL database via Prisma.
 * This ensures the database is reachable before the server fully starts.
 */
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Successfully connected to the database.');
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error);
    // In a production environment, you might want to exit if the DB is critical
    process.exit(1);
  }
};

/**
 * Gracefully closes the database connection.
 * Used during application shutdown.
 */
export const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log('📦 Disconnected from the database.');
  } catch (error) {
    console.error('❌ Error disconnecting from the database:', error);
  }
};
