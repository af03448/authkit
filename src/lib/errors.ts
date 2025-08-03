import { NextResponse } from 'next/server';
import { logError } from './logger';
import { ERROR_MESSAGES } from './constants';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED, details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = ERROR_MESSAGES.SERVER.RATE_LIMIT_EXCEEDED, details?: any) {
    super(message, 429, 'RATE_LIMIT_ERROR', details);
    this.name = 'RateLimitError';
  }
}

export function handleError(error: unknown, context?: Record<string, any>): NextResponse {
  logError(error, context);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    const isProduction = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      {
        error: {
          message: isProduction ? ERROR_MESSAGES.SERVER.INTERNAL_ERROR : error.message,
          code: 'INTERNAL_ERROR',
        },
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: {
        message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
        code: 'UNKNOWN_ERROR',
      },
    },
    { status: 500 }
  );
}

export function isWorkOSError(error: any): boolean {
  return error?.name === 'WorkOSError' || error?.constructor?.name === 'WorkOSError';
}

export function handleWorkOSError(error: any): NextResponse {
  logError(error, { type: 'WorkOS Error' });
  
  const statusCode = error.status || 500;
  const message = error.message || ERROR_MESSAGES.SERVER.INTERNAL_ERROR;
  
  return NextResponse.json(
    {
      error: {
        message: process.env.NODE_ENV === 'production' ? ERROR_MESSAGES.SERVER.INTERNAL_ERROR : message,
        code: 'WORKOS_ERROR',
      },
    },
    { status: statusCode }
  );
}