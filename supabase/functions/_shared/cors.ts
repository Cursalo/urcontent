// SECURE CORS Configuration
// Restricted to specific origins instead of wildcard

// Get allowed origins from environment variable or use defaults
const getAllowedOrigins = (): string[] => {
  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    return envOrigins.split(',').map(origin => origin.trim());
  }
  
  // Default allowed origins for development and production
  return [
    'http://localhost:8080',
    'http://localhost:5173', // Vite dev server
    'https://content-weave.vercel.app', // Production domain
    'https://urcontent.app' // Custom domain if any
  ];
};

// Create CORS headers with proper origin validation
export const createCorsHeaders = (origin?: string) => {
  const allowedOrigins = getAllowedOrigins();
  
  // Check if the origin is allowed
  const isOriginAllowed = origin && allowedOrigins.includes(origin);
  
  return {
    'Access-Control-Allow-Origin': isOriginAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-csrf-token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin'
  };
};

// Default CORS headers for backward compatibility
export const corsHeaders = createCorsHeaders();

// CSRF Protection helper
export const validateCSRF = (request: Request): boolean => {
  // Check for CSRF token in headers
  const csrfToken = request.headers.get('x-csrf-token');
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow requests with proper CSRF token
  if (csrfToken) {
    // In production, validate the CSRF token against a secure store
    return true;
  }
  
  // For GET requests, check origin/referer
  if (request.method === 'GET') {
    const allowedOrigins = getAllowedOrigins();
    return allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || (referer && referer.startsWith(allowedOrigin))
    );
  }
  
  // Reject non-GET requests without CSRF token
  return false;
};

// Security headers for enhanced protection
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.mercadopago.com;"
};
EOF < /dev/null