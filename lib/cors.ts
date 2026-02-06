import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Allowed origins for CORS
 * In development: http://localhost:8081 (React Native app)
 * In production: the domain specified in NEXT_PUBLIC_APP_URL
 */
export const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];

  // Always allow localhost for development
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:8081');
    origins.push('http://localhost:3000');
    origins.push('http://192.168.100.9:3000')
  }

  // Add production domain if NEXT_PUBLIC_APP_URL is set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    // Extract domain from URL
    try {
      const url = new URL(appUrl);
      origins.push(url.origin);
    } catch {
      console.warn('Invalid NEXT_PUBLIC_APP_URL:', appUrl);
    }
  }

  return origins;
};

/**
 * Apply CORS headers to a NextResponse
 */
export const applyCorsHeaders = (
  response: NextResponse,
  origin?: string
): NextResponse => {
  const allowedOrigins = getAllowedOrigins();
  const isOriginAllowed =
    !origin || allowedOrigins.includes(origin);

  if (isOriginAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
};

/**
 * Handle CORS preflight requests (OPTIONS method)
 */
export const handleCorsPreFlight = (origin?: string): NextResponse => {
  const response = new NextResponse(null, { status: 204 });
  return applyCorsHeaders(response, origin);
};

/**
 * Middleware to add CORS headers to any response
 * Usage: return addCorsHeaders(NextResponse.json({ data }), request);
 */
export const addCorsHeaders = (
  response: NextResponse,
  request: NextRequest
): NextResponse => {
  const origin = request.headers.get('origin') || undefined;
  return applyCorsHeaders(response, origin);
};
