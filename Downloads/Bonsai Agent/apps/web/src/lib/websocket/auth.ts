import { Socket } from 'socket.io';
import { verify, sign } from 'jsonwebtoken';
import { WebSocketAuth } from './types';

export class AuthManager {
  private readonly JWT_SECRET: string;
  private readonly TOKEN_EXPIRY: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ JWT_SECRET not set, using default (not secure for production)');
    }
  }

  /**
   * Authenticate a WebSocket connection
   */
  async authenticate(socket: Socket): Promise<WebSocketAuth | null> {
    try {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        console.log('❌ No token provided in WebSocket auth');
        return null;
      }

      // Verify JWT token
      const decoded = this.verifyToken(token);
      if (!decoded) {
        console.log('❌ Invalid token in WebSocket auth');
        return null;
      }

      // Extract user information
      const userId = decoded.userId || socket.handshake.auth?.userId;
      const sessionId = decoded.sessionId || socket.handshake.auth?.sessionId || this.generateSessionId();

      if (!userId) {
        console.log('❌ No userId found in token or auth data');
        return null;
      }

      // Additional validation (integrate with your user service)
      const isValidUser = await this.validateUser(userId);
      if (!isValidUser) {
        console.log(`❌ User validation failed for userId: ${userId}`);
        return null;
      }

      const auth: WebSocketAuth = {
        token,
        userId,
        sessionId,
        expiresAt: decoded.exp ? decoded.exp * 1000 : Date.now() + this.TOKEN_EXPIRY,
      };

      console.log(`✅ WebSocket authentication successful for user: ${userId}`);
      return auth;

    } catch (error) {
      console.error('❌ WebSocket authentication error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token
   */
  private verifyToken(token: string): any {
    try {
      return verify(token, this.JWT_SECRET);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return null;
    }
  }

  /**
   * Generate a new auth token
   */
  generateToken(userId: string, sessionId?: string): string {
    const payload = {
      userId,
      sessionId: sessionId || this.generateSessionId(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor((Date.now() + this.TOKEN_EXPIRY) / 1000),
    };

    return sign(payload, this.JWT_SECRET);
  }

  /**
   * Generate a session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Validate user exists and is active
   */
  private async validateUser(userId: string): Promise<boolean> {
    try {
      // This would integrate with your user service/database
      // For now, we'll do basic validation
      
      if (!userId || typeof userId !== 'string') {
        return false;
      }

      // Check if userId format is valid (customize based on your system)
      if (userId.length < 3) {
        return false;
      }

      // Here you would typically:
      // 1. Check if user exists in database
      // 2. Check if user account is active
      // 3. Check if user has necessary permissions
      // 4. Check for any account restrictions

      // For now, return true for demo purposes
      return true;

    } catch (error) {
      console.error('❌ User validation error:', error);
      return false;
    }
  }

  /**
   * Refresh an expiring token
   */
  async refreshToken(currentToken: string): Promise<string | null> {
    try {
      const decoded = this.verifyToken(currentToken);
      if (!decoded) {
        return null;
      }

      // Check if token is close to expiry (within 1 hour)
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      
      if (timeUntilExpiry > 3600) { // More than 1 hour remaining
        return currentToken; // No need to refresh
      }

      // Generate new token
      return this.generateToken(decoded.userId, decoded.sessionId);

    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return null;
    }
  }

  /**
   * Validate token expiry
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.verifyToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;

    } catch (error) {
      return true;
    }
  }

  /**
   * Extract user ID from token without full verification
   */
  extractUserId(token: string): string | null {
    try {
      // Decode without verification to extract userId
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      return payload.userId || null;

    } catch (error) {
      return null;
    }
  }

  /**
   * Create temporary guest token
   */
  createGuestToken(): string {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return this.generateToken(guestId);
  }

  /**
   * Validate socket middleware
   */
  createSocketMiddleware() {
    return async (socket: Socket, next: Function) => {
      try {
        const auth = await this.authenticate(socket);
        if (!auth) {
          return next(new Error('Authentication failed'));
        }

        // Store auth in socket data
        socket.data.auth = auth;
        socket.data.userId = auth.userId;
        socket.data.sessionId = auth.sessionId;

        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    };
  }

  /**
   * Create rate limiting per user
   */
  private rateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  checkRateLimit(userId: string, limit: number = 60, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userLimit = this.rateLimitMap.get(userId);

    if (!userLimit) {
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > userLimit.resetTime) {
      this.rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= limit) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  /**
   * Get authentication statistics
   */
  getAuthStats(): {
    totalSockets: number;
    authenticatedSockets: number;
    guestSockets: number;
    rateLimitedUsers: number;
  } {
    const guestSockets = Array.from(this.rateLimitMap.keys())
      .filter(userId => userId.startsWith('guest_')).length;

    return {
      totalSockets: this.rateLimitMap.size,
      authenticatedSockets: this.rateLimitMap.size - guestSockets,
      guestSockets,
      rateLimitedUsers: this.rateLimitMap.size,
    };
  }

  /**
   * Clean up expired rate limits
   */
  cleanupRateLimits(): void {
    const now = Date.now();
    for (const [userId, limit] of this.rateLimitMap.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitMap.delete(userId);
      }
    }
  }

  /**
   * Start automatic cleanup
   */
  startAutoCleanup(intervalMs: number = 300000): NodeJS.Timeout { // 5 minutes
    return setInterval(() => {
      this.cleanupRateLimits();
    }, intervalMs);
  }

  /**
   * Revoke token/session
   */
  private revokedTokens: Set<string> = new Set();

  revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Enhanced authentication with revocation check
   */
  async authenticateWithRevocation(socket: Socket): Promise<WebSocketAuth | null> {
    const auth = await this.authenticate(socket);
    if (!auth) {
      return null;
    }

    if (this.isTokenRevoked(auth.token)) {
      console.log(`❌ Token revoked for user: ${auth.userId}`);
      return null;
    }

    return auth;
  }

  /**
   * Security headers validation
   */
  validateSecurityHeaders(socket: Socket): boolean {
    const headers = socket.handshake.headers;
    
    // Check origin if specified
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.length > 0) {
      const origin = headers.origin;
      if (!origin || !allowedOrigins.includes(origin)) {
        console.log(`❌ Invalid origin: ${origin}`);
        return false;
      }
    }

    // Check user agent
    const userAgent = headers['user-agent'];
    if (!userAgent) {
      console.log('❌ No user agent provided');
      return false;
    }

    return true;
  }

  /**
   * IP-based rate limiting
   */
  private ipRateLimitMap: Map<string, { count: number; resetTime: number }> = new Map();

  checkIPRateLimit(ip: string, limit: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const ipLimit = this.ipRateLimitMap.get(ip);

    if (!ipLimit) {
      this.ipRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > ipLimit.resetTime) {
      this.ipRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (ipLimit.count >= limit) {
      return false;
    }

    ipLimit.count++;
    return true;
  }
}