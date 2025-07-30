// Webhook Security Utilities
import { createHmac } from 'crypto'; // Verify MercadoPago webhook signature
export const verifyMercadoPagoWebhook = ( payload: string, signature: string, secret: string
): boolean => { try { const expectedSignature = createHmac('sha256', secret) .update(payload) .digest('hex'); // Use timingSafeEqual to prevent timing attacks return timingSafeEqual(signature, expectedSignature); } catch (error) { console.error('Webhook verification error:', error); return false; }
}; // Timing-safe string comparison to prevent timing attacks
const timingSafeEqual = (a: string, b: string): boolean => { if (a.length !== b.length) { return false; } let result = 0; for (let i = 0; i < a.length; i++) { result |= a.charCodeAt(i) ^ b.charCodeAt(i); } return result === 0;
}; // Rate limiting for webhook endpoints
interface RateLimitEntry { count: number; resetTime: number;
} const rateLimitStore = new Map<string, RateLimitEntry>(); export const checkWebhookRateLimit = ( clientId: string, maxRequests: number = 100, windowMs: number = 60000 // 1 minute
): boolean => { const now = Date.now(); const key = `webhook_${clientId}`; const entry = rateLimitStore.get(key); if (!entry || now > entry.resetTime) { rateLimitStore.set(key, { count: 1, resetTime: now + windowMs }); return true; } if (entry.count >= maxRequests) { return false; } entry.count++; return true;
}; // Clean up expired rate limit entries
setInterval(() => { const now = Date.now(); for (const [key, entry] of rateLimitStore.entries()) { if (now > entry.resetTime) { rateLimitStore.delete(key); } }
}, 300000); // Clean up every 5 minutes // Validate webhook payload structure
export const validateWebhookPayload = (payload: any): boolean => { if (!payload || typeof payload !== 'object') { return false; } // Check required fields for MercadoPago webhooks if (payload.type && payload.data && payload.data.id) { return true; } return false;
}; // IP whitelist for webhook sources (MercadoPago IPs)
const MERCADOPAGO_IPS = [ '209.225.49.0/24', '216.33.197.0/24', '216.33.196.0/24'
]; export const isAllowedWebhookIP = (clientIP: string): boolean => { // In production, implement proper IP range checking // For now, allow all IPs but log them for monitoring console.log('Webhook request from IP:', clientIP); return true;
}; // Generate secure webhook URLs with tokens
export const generateSecureWebhookToken = (): string => { return Array.from(crypto.getRandomValues(new Uint8Array(32))) .map(b => b.toString(16).padStart(2, '0')) .join('');
}; export default { verifyMercadoPagoWebhook, checkWebhookRateLimit, validateWebhookPayload, isAllowedWebhookIP, generateSecureWebhookToken
};