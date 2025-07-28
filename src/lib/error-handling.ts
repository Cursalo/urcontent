export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}

// Supabase error handler
export const handleSupabaseError = (error: any, context: string): ApiError => {
  // Handle specific Supabase error codes
  switch (error.code) {
    case 'PGRST116':
      return new NotFoundError();
    case '23505':
      return new ValidationError('Duplicate entry', { field: 'unique_constraint' });
    case '23503':
      return new ValidationError('Referenced record does not exist');
    case '42P01':
      return new ApiError('Database table not found', 500, 'TABLE_NOT_FOUND');
    case 'PGRST301':
      return new AuthorizationError('Row Level Security policy violation');
    default:
      console.error(`Supabase error in ${context}:`, error);
      return new ApiError(
        error.message || 'Database operation failed',
        500,
        'DATABASE_ERROR',
        { context, originalError: error }
      );
  }
};

// Global error response formatter
export const formatErrorResponse = (error: Error) => {
  if (error instanceof ApiError) {
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message,
        statusCode: error.statusCode,
        details: error.details
      },
      timestamp: new Date().toISOString()
    };
  }

  // Unknown error
  console.error('Unhandled error:', error);
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      statusCode: 500
    },
    timestamp: new Date().toISOString()
  };
};

// Error boundary for React Query
export const queryErrorHandler = (error: Error) => {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        // Show permission denied toast
        console.error('Access denied:', error.message);
        break;
      case 429:
        // Show rate limit toast
        console.warn('Rate limit exceeded:', error.message);
        break;
      default:
        console.error('API Error:', error.message);
    }
  } else {
    console.error('Unknown error:', error);
  }
};

// Validation helper
export const validateAndThrow = <T>(
  schema: any,
  data: unknown,
  context: string
): T => {
  try {
    return schema.parse(data);
  } catch (error: any) {
    const errors: Record<string, string> = {};
    
    if (error.errors) {
      error.errors.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
    }
    
    throw new ValidationError(`Validation failed in ${context}`, errors);
  }
};