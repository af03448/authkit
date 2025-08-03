import { NextRequest, NextResponse } from 'next/server';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';
import { rateLimitMiddleware } from './lib/rate-limit';
import { AUTH_CONSTANTS } from './lib/constants';
import { logDebug } from './lib/logger';

export default async function middleware(request: NextRequest) {
  const rateLimitResponse = rateLimitMiddleware(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const authkitHandler = authkitMiddleware({ 
    debug: process.env.NODE_ENV !== 'production' 
  });
  
  const response = await authkitHandler(request);
  
  if (!response) {
    return NextResponse.next();
  }

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

  logDebug('Middleware executed', {
    path: request.nextUrl.pathname,
    method: request.method,
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/using-hosted-authkit/with-nextjs',
    '/using-your-own-ui/((?!public).*)',
  ],
};