import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { handleError } from '@/lib/errors';

interface Metrics {
  timestamp: string;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpu: {
    user: number;
    system: number;
  };
  uptime: number;
  version: {
    node: string;
    app?: string;
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics: Metrics = {
      timestamp: new Date().toISOString(),
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
      },
      uptime: Math.round(process.uptime()),
      version: {
        node: process.version,
        app: process.env.npm_package_version,
      },
    };

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return handleError(error, { endpoint: 'metrics' });
  }
}