import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getEnv } from '@/lib/env';
import { logInfo } from '@/lib/logger';

const env = getEnv();
const workos = new WorkOS(env.WORKOS_API_KEY);

export async function GET(request: NextRequest) {
  const returnPathname = request.nextUrl.searchParams.get('returnTo') || '/dashboard';
  
  const authorizationUrl = workos.userManagement.getAuthorizationUrl({
    clientId: env.WORKOS_CLIENT_ID,
    provider: 'authkit',
    redirectUri: `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    state: Buffer.from(JSON.stringify({ returnTo: returnPathname })).toString('base64'),
  });

  logInfo('Redirecting to WorkOS sign in', { returnTo: returnPathname });
  
  return NextResponse.redirect(authorizationUrl);
}