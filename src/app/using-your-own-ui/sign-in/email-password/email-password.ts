'use server';

import { WorkOS } from '@workos-inc/node';
import { redirect } from 'next/navigation';
import { getEnv } from '@/lib/env';
import { validateRequest, signInSchema } from '@/lib/validation';
import { logInfo, logWarning } from '@/lib/logger';
import { ValidationError } from '@/lib/errors';

const env = getEnv();
const workos = new WorkOS(env.WORKOS_API_KEY);

export async function signIn(prevState: any, formData: FormData) {
  try {
    const validatedData = await validateRequest(signInSchema, {
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const { user } = await workos.userManagement.authenticateWithPassword({
      clientId: env.WORKOS_CLIENT_ID,
      email: validatedData.email,
      password: validatedData.password,
    });

    logInfo('User signed in successfully', { 
      userId: user.id, 
      email: user.email 
    });

    redirect('/using-your-own-ui');
  } catch (error: any) {
    if (error instanceof ValidationError) {
      return { error: error.message };
    }

    const errorMessage = error?.message || 'Authentication failed';
    const errorCode = error?.code;

    logWarning('Sign in failed', { 
      error: errorMessage,
      code: errorCode,
      email: formData.get('email'),
    });

    if (errorCode === 'user_not_found' || errorCode === 'invalid_credentials') {
      return { error: 'Invalid email or password' };
    }

    if (errorCode === 'email_verification_required') {
      redirect(`/using-your-own-ui/verify-email?email=${encodeURIComponent(String(formData.get('email')))}`);
    }

    if (errorCode === 'mfa_required') {
      redirect(`/using-your-own-ui/mfa?userId=${error.userId}`);
    }

    return { error: 'An error occurred during sign in. Please try again.' };
  }
}
