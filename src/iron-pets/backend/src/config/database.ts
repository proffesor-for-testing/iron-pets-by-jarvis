import { PrismaClient } from '@prisma/client';
import { appConfig } from './index';

/**
 * Prisma Client Singleton
 * Ensures single database connection across application
 */
class DatabaseService {
  private static instance: PrismaClient;

  private constructor() {}

  /**
   * Get Prisma Client instance
   * Creates new instance if doesn't exist
   */
  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log: appConfig.app.isDevelopment
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        errorFormat: appConfig.app.isDevelopment ? 'pretty' : 'minimal',
      });

      // Handle graceful shutdown
      DatabaseService.setupShutdownHandlers();
    }

    return DatabaseService.instance;
  }

  /**
   * Connect to database
   */
  public static async connect(): Promise<void> {
    const client = DatabaseService.getInstance();
    await client.$connect();
    console.log('✅ Database connected successfully');
  }

  /**
   * Disconnect from database
   */
  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      console.log('✅ Database disconnected successfully');
    }
  }

  /**
   * Setup graceful shutdown handlers
   */
  private static setupShutdownHandlers(): void {
    const shutdownHandler = async () => {
      await DatabaseService.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('beforeExit', shutdownHandler);
  }

  /**
   * Health check - test database connection
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      const client = DatabaseService.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Execute database transaction
   */
  public static async transaction<T>(
    callback: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const client = DatabaseService.getInstance();
    return client.$transaction(async (tx) => {
      return callback(tx as PrismaClient);
    });
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance();

// Export service for advanced operations
export { DatabaseService };
