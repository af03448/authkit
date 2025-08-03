import { z } from 'zod';

const envSchema = z.object({
  // WorkOS Configuration
  WORKOS_CLIENT_ID: z.string().min(1, 'WORKOS_CLIENT_ID is required'),
  WORKOS_API_KEY: z.string().min(1, 'WORKOS_API_KEY is required'),
  
  // JWT Configuration
  JWT_SECRET_KEY: z.string().min(1, 'JWT_SECRET_KEY is required'),
  
  // Optional SSO Configuration
  SSO_ENABLED_ORGANIZATION_ID: z.string().optional(),
  
  // Application Configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Security Headers
  SECURE_HEADERS_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.string().transform((val) => val === 'true').default('true'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform((val) => parseInt(val, 10)).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform((val) => parseInt(val, 10)).default('900000'),
  
  // Session Configuration
  SESSION_COOKIE_NAME: z.string().default('authkit_session'),
  SESSION_COOKIE_MAX_AGE: z.string().transform((val) => parseInt(val, 10)).default('86400'),
  SESSION_COOKIE_SECURE: z.string().transform((val) => val === 'true').default('true'),
  SESSION_COOKIE_HTTPONLY: z.string().transform((val) => val === 'true').default('true'),
  SESSION_COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  
  // CORS Configuration
  CORS_ALLOWED_ORIGINS: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

let env: Env | undefined;

export function getEnv(): Env {
  // Skip validation during build time
  if (process.env.NODE_ENV === undefined || process.env.NEXT_PHASE === 'phase-production-build') {
    return process.env as any;
  }

  if (!env) {
    const parsed = envSchema.safeParse(process.env);
    
    if (!parsed.success) {
      console.error('Invalid environment variables:');
      console.error(JSON.stringify(parsed.error.flatten().fieldErrors, null, 2));
      throw new Error('Invalid environment variables');
    }
    
    env = parsed.data;
  }
  
  return env;
}

export function validateEnv() {
  try {
    getEnv();
    console.log('Environment variables validated successfully');
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}