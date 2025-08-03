import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_CONSTANTS } from '@/lib/constants';
import { logInfo } from '@/lib/logger';
import { getUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Log the user out for audit purposes
    const { user } = await getUser();
    if (user) {
      logInfo('User signed out', { userId: user.id, email: user.email });
    }
  } catch {
    // User wasn't authenticated, that's fine
  }

  // Clear the session cookie
  cookies().delete(AUTH_CONSTANTS.SESSION.COOKIE_NAME);
  
  // Determine redirect URL
  const returnTo = request.nextUrl.searchParams.get('returnTo') || '/';
  
  return NextResponse.redirect(new URL(returnTo, request.url));
}

export async function POST(request: NextRequest) {
  // Support both GET and POST for sign out
  return GET(request);
}