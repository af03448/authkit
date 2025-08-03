import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify, SignJWT } from 'jose';
import type { User } from '@workos-inc/node';
import { getEnv } from './env';
import { AUTH_CONSTANTS } from './constants';
import { AuthenticationError } from './errors';
import { logDebug, logWarning } from './logger';

export function getJwtSecretKey() {
  const env = getEnv();
  const secret = env.JWT_SECRET_KEY;

  if (!secret) {
    throw new Error('JWT_SECRET_KEY is not set');
  }

  return new Uint8Array(Buffer.from(secret, 'base64'));
}

export async function verifyJwtToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    logDebug('JWT token verified successfully');
    return payload;
  } catch (error) {
    logWarning('JWT verification failed', { error });
    return null;
  }
}

export async function createJwtToken(user: User, expiresIn: string = '1h') {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setJti(crypto.randomUUID())
    .sign(getJwtSecretKey());
    
  logDebug('JWT token created', { userId: user.id });
  return token;
}

export async function getUser(): Promise<{
  isAuthenticated: boolean;
  user?: User | null;
}> {
  const token = cookies().get(AUTH_CONSTANTS.SESSION.COOKIE_NAME)?.value;

  if (!token) {
    return { isAuthenticated: false };
  }

  const verifiedToken = await verifyJwtToken(token);
  if (verifiedToken && verifiedToken.user) {
    return {
      isAuthenticated: true,
      user: verifiedToken.user as User,
    };
  }

  return { isAuthenticated: false };
}

export async function requireAuth(): Promise<User> {
  const { isAuthenticated, user } = await getUser();
  
  if (!isAuthenticated || !user) {
    throw new AuthenticationError('Authentication required');
  }
  
  return user;
}

export function setAuthCookie(token: string) {
  cookies().set({
    name: AUTH_CONSTANTS.SESSION.COOKIE_NAME,
    value: token,
    httpOnly: AUTH_CONSTANTS.SESSION.HTTP_ONLY,
    path: '/',
    secure: AUTH_CONSTANTS.SESSION.SECURE,
    sameSite: AUTH_CONSTANTS.SESSION.SAME_SITE,
    maxAge: AUTH_CONSTANTS.SESSION.MAX_AGE,
  });
}

export async function signOut() {
  cookies().delete(AUTH_CONSTANTS.SESSION.COOKIE_NAME);
  logDebug('User signed out');
  redirect('/');
}

export function sanitizeUser(user: User): Partial<User> {
  const { 
    id, 
    email, 
    firstName, 
    lastName, 
    emailVerified,
    profilePictureUrl,
    createdAt,
    updatedAt,
  } = user;
  
  return {
    id,
    email,
    firstName,
    lastName,
    emailVerified,
    profilePictureUrl,
    createdAt,
    updatedAt,
  };
}