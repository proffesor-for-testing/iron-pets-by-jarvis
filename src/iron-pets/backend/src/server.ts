import { app } from './app';
import { appConfig } from './config/index';
import { DatabaseService } from './config/database';

/**
 * Server startup function
 */
async function startServer(): Promise<void> {
  try {
    // ============================================
    // Database Connection
    // ============================================

    console.log('🔌 Connecting to database...');
    await DatabaseService.connect();

    // Verify database connection
    const isHealthy = await DatabaseService.healthCheck();
    if (!isHealthy) {
      throw new Error('Database health check failed');
    }

    // ============================================
    // Start Express Server
    // ============================================

    const port = appConfig.app.port;

    app.listen(port, () => {
      console.log('');
      console.log('🚀 =======================================');
      console.log(`🚀 Iron Pets Backend API`);
      console.log('🚀 =======================================');
      console.log(`🚀 Environment: ${appConfig.app.env}`);
      console.log(`🚀 Port: ${port}`);
      console.log(`🚀 API Version: ${appConfig.app.apiVersion}`);
      console.log(`🚀 API URL: http://localhost:${port}/api/${appConfig.app.apiVersion}`);
      console.log(`🚀 Health Check: http://localhost:${port}/health`);
      console.log('🚀 =======================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n⚠️  Received ${signal}, starting graceful shutdown...`);

  try {
    // Disconnect from database
    await DatabaseService.disconnect();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// ============================================
// Shutdown Signal Handlers
// ============================================

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============================================
// Unhandled Error Handlers
// ============================================

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production - log and continue
  if (appConfig.app.isDevelopment) {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Exit on uncaught exceptions
  process.exit(1);
});

// ============================================
// Start Server
// ============================================

if (require.main === module) {
  startServer();
}

// Export for testing
export { startServer };
