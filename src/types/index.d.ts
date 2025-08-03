import { User } from '@workos-inc/node';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // WorkOS Configuration
      WORKOS_CLIENT_ID: string;
      WORKOS_API_KEY: string;
      
      // JWT Configuration
      JWT_SECRET_KEY: string;
      
      // Optional SSO Configuration
      SSO_ENABLED_ORGANIZATION_ID?: string;
      
      // Application Configuration
      NODE_ENV: 'development' | 'test' | 'production';
      NEXT_PUBLIC_APP_URL?: string;
      
      // Security Headers
      SECURE_HEADERS_ENABLED?: string;
      
      // Rate Limiting
      RATE_LIMIT_ENABLED?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      RATE_LIMIT_WINDOW_MS?: string;
      
      // Session Configuration
      SESSION_COOKIE_NAME?: string;
      SESSION_COOKIE_MAX_AGE?: string;
      SESSION_COOKIE_SECURE?: string;
      SESSION_COOKIE_HTTPONLY?: string;
      SESSION_COOKIE_SAMESITE?: 'lax' | 'strict' | 'none';
      
      // CORS Configuration
      CORS_ALLOWED_ORIGINS?: string;
      
      // Logging
      LOG_LEVEL?: string;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface SessionData {
  user: User;
  expiresAt: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export {};