import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from './constants';
import { RateLimitError } from './errors';
import { logWarning } from './logger';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const path = request.nextUrl.pathname;
  
  return `${ip}:${path}`;
}

export function checkRateLimit(key: string): boolean {
  if (!AUTH_CONSTANTS.RATE_LIMIT.ENABLED) {
    return true;
  }

  const now = Date.now();
  const limit = AUTH_CONSTANTS.RATE_LIMIT.MAX_REQUESTS;
  const windowMs = AUTH_CONSTANTS.RATE_LIMIT.WINDOW_MS;

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return true;
  }

  if (store[key].count >= limit) {
    logWarning('Rate limit exceeded', { key, count: store[key].count });
    return false;
  }

  store[key].count++;
  return true;
}

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const key = getRateLimitKey(request);
  
  if (!checkRateLimit(key)) {
    const retryAfter = Math.ceil((store[key].resetTime - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': AUTH_CONSTANTS.RATE_LIMIT.MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(store[key].resetTime).toISOString(),
        },
      }
    );
  }

  const remaining = AUTH_CONSTANTS.RATE_LIMIT.MAX_REQUESTS - store[key].count;
  
  return null;
}

export function cleanupRateLimitStore() {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 60000);
}