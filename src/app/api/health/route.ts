import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getEnv } from '@/lib/env';
import { logInfo, logError } from '@/lib/logger';

let workos: WorkOS | null = null;

try {
  const env = getEnv();
  workos = new WorkOS(env.WORKOS_API_KEY);
} catch (error) {
  logError(error, { context: 'Health check initialization' });
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    environment: boolean;
    workos: boolean;
  };
  version?: string;
  environment?: string;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      environment: false,
      workos: false,
    },
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
  };

  try {
    const env = getEnv();
    response.checks.environment = true;
  } catch (error) {
    response.status = 'unhealthy';
    logError(error, { context: 'Health check - environment validation' });
  }

  if (workos) {
    try {
      const users = await workos.userManagement.listUsers({
        limit: 1,
      });
      response.checks.workos = true;
    } catch (error) {
      response.status = response.status === 'unhealthy' ? 'unhealthy' : 'degraded';
      logError(error, { context: 'Health check - WorkOS connectivity' });
    }
  } else {
    response.status = 'unhealthy';
  }

  const responseTime = Date.now() - startTime;
  
  logInfo('Health check performed', {
    status: response.status,
    responseTime,
    checks: response.checks,
  });

  const httpStatus = response.status === 'healthy' ? 200 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Response-Time': `${responseTime}ms`,
    },
  });
}

export async function HEAD(request: NextRequest) {
  return GET(request);
}