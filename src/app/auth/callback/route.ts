import { WorkOS } from '@workos-inc/node';
import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { createJwtToken, setAuthCookie } from '@/lib/auth';
import { handleError, handleWorkOSError, isWorkOSError } from '@/lib/errors';
import { logInfo } from '@/lib/logger';
import { isValidRedirectUrl } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const env = getEnv();
  const workos = new WorkOS(env.WORKOS_API_KEY);
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      logInfo('OAuth error received', { error, errorDescription });
      return NextResponse.redirect(
        new URL(`/auth/error?message=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate authorization code
    if (!code) {
      return handleError(new Error('Authorization code is missing'));
    }

    // Authenticate with WorkOS
    const { user } = await workos.userManagement.authenticateWithCode({
      clientId: env.WORKOS_CLIENT_ID,
      code,
    });

    // Create JWT session
    const token = await createJwtToken(user);
    setAuthCookie(token);
    
    logInfo('User authenticated successfully', { 
      userId: user.id, 
      email: user.email 
    });

    // Determine redirect URL
    let redirectUrl = '/dashboard';
    
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        if (stateData.returnTo && isValidRedirectUrl(stateData.returnTo, [request.headers.get('host') || ''])) {
          redirectUrl = stateData.returnTo;
        }
      } catch {
        logInfo('Invalid state parameter, using default redirect');
      }
    }

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    if (isWorkOSError(error)) {
      return handleWorkOSError(error);
    }
    return handleError(error, { endpoint: 'auth_callback' });
  }
}