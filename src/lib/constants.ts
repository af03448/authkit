export const AUTH_CONSTANTS = {
  SESSION: {
    COOKIE_NAME: process.env.SESSION_COOKIE_NAME || 'authkit_session',
    MAX_AGE: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400', 10),
    SECURE: process.env.SESSION_COOKIE_SECURE !== 'false',
    HTTP_ONLY: process.env.SESSION_COOKIE_HTTPONLY !== 'false',
    SAME_SITE: (process.env.SESSION_COOKIE_SAMESITE || 'lax') as 'lax' | 'strict' | 'none',
  },
  RATE_LIMIT: {
    ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  },
  SECURITY: {
    HEADERS_ENABLED: process.env.SECURE_HEADERS_ENABLED === 'true',
  },
  CORS: {
    ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [],
  },
} as const;

export const ERROR_MESSAGES = {
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
    UNAUTHORIZED: 'You are not authorized to access this resource',
    INVALID_TOKEN: 'Invalid or expired token',
    MISSING_TOKEN: 'Authentication token is missing',
  },
  VALIDATION: {
    INVALID_EMAIL: 'Please provide a valid email address',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long',
    PASSWORD_REQUIREMENTS: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    REQUIRED_FIELD: 'This field is required',
  },
  SERVER: {
    INTERNAL_ERROR: 'An unexpected error occurred. Please try again later.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please try again later.',
  },
} as const;