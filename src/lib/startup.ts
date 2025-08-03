import { validateEnv } from './env';
import { logInfo, logError } from './logger';
import { WorkOS } from '@workos-inc/node';

export async function validateStartup(): Promise<void> {
  logInfo('Starting application validation...');

  try {
    logInfo('Validating environment variables...');
    validateEnv();
    logInfo('Environment variables validated successfully');

    logInfo('Testing WorkOS connection...');
    const workos = new WorkOS(process.env.WORKOS_API_KEY!);
    
    try {
      await workos.userManagement.listUsers({ limit: 1 });
      logInfo('WorkOS connection successful');
    } catch (error) {
      logError(error, { context: 'WorkOS connection test' });
      throw new Error('Failed to connect to WorkOS API. Please check your API key.');
    }

    logInfo('Startup validation completed successfully');
  } catch (error) {
    logError(error, { context: 'Startup validation' });
    throw error;
  }
}

export function setupGracefulShutdown(): void {
  let isShuttingDown = false;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logInfo(`Received ${signal}, starting graceful shutdown...`);

    setTimeout(() => {
      logError(new Error('Graceful shutdown timeout'), { signal });
      process.exit(1);
    }, 30000);

    try {
      logInfo('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logError(error, { context: 'Graceful shutdown error' });
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  process.on('uncaughtException', (error) => {
    logError(error, { context: 'Uncaught exception' });
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    logError(new Error(`Unhandled rejection: ${reason}`), { 
      context: 'Unhandled rejection',
      promise 
    });
  });

  logInfo('Graceful shutdown handlers configured');
}