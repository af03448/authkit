import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONSTANTS } from './constants';
import { rateLimitMiddleware } from './rate-limit';
import { logDebug } from './logger';

export function applySecurityHeaders(response: NextResponse): NextResponse {
  if (AUTH_CONSTANTS.SECURITY.HEADERS_ENABLED) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.workos.com"
    );
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }
  }
  
  return response;
}

export function securityMiddleware(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    // Check rate limiting first
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    
    // Apply the handler
    const response = await handler(request);
    
    // Apply security headers
    applySecurityHeaders(response);
    
    logDebug('Security middleware executed', {
      path: request.nextUrl.pathname,
      method: request.method,
    });
    
    return response;
  };
}