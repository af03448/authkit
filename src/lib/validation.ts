import { z } from 'zod';
import { ValidationError } from './errors';
import { ERROR_MESSAGES } from './constants';

export const emailSchema = z
  .string()
  .email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL)
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIREMENTS
  );

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).trim(),
  lastName: z.string().min(1).trim(),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const mfaSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
  challengeId: z.string().min(1),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  email: emailSchema.optional(),
});

export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new ValidationError(messages.join(', '), error.errors);
    }
    throw error;
  }
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidRedirectUrl(url: string, allowedHosts?: string[]): boolean {
  if (!isValidUrl(url)) {
    return false;
  }

  const parsedUrl = new URL(url);
  
  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    return false;
  }

  if (allowedHosts && allowedHosts.length > 0) {
    return allowedHosts.includes(parsedUrl.host);
  }

  return true;
}