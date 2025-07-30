// MercadoPago Configuration and Service
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

/**
 * MercadoPago Credentials - SECURE VERSION
 * These credentials are loaded from environment variables
 * Access token should NEVER be exposed in client-side code
 */
export const MERCADOPAGO_CONFIG = {
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '',
  // Access token is handled server-side only via Supabase Edge Functions
};

// Validate that required credentials are present
if (!MERCADOPAGO_CONFIG.publicKey) {
  console.warn('VITE_MERCADOPAGO_PUBLIC_KEY is not configured. Payment functionality will be limited.');
}

/**
 * CLIENT-SIDE: Only use public key for frontend operations
 * This is safe to expose as it's designed for client-side use
 */
export const getPublicKey = (): string => MERCADOPAGO_CONFIG.publicKey;

// Payment types
export type PaymentType = 'membership' | 'collaboration' | 'experience' | 'campaign_deposit';

export type PaymentStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled';

export type MembershipTier = 'basic' | 'premium' | 'vip';

export type BillingPeriod = 'monthly' | 'yearly';

/**
 * Base payment data interface
 */
export interface PaymentData {
  amount: number;
  description: string;
  paymentType: PaymentType;
  userId: string;
  userEmail: string;
  userName: string;
  metadata?: Record<string, any>;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

/**
 * Membership-specific payment data
 */
export interface MembershipPaymentData extends PaymentData {
  membershipTier: MembershipTier;
  billingPeriod: BillingPeriod;
}

/**
 * Collaboration-specific payment data
 */
export interface CollaborationPaymentData extends PaymentData {
  collaborationId: string;
  creatorId: string;
  brandId: string;
  paymentSplit?: {
    creatorAmount: number;
    platformFee: number;
  };
}

/**
 * Experience-specific payment data
 */
export interface ExperiencePaymentData extends PaymentData {
  experienceId: string;
  creatorId: string;
  participantCount: number;
}

/**
 * Campaign deposit payment data
 */
export interface CampaignDepositPaymentData extends PaymentData {
  campaignId: string;
  brandId: string;
  depositType: 'initial' | 'additional' | 'milestone';
}

/**
 * Payment preference creation result
 */
export interface PaymentPreferenceResult {
  success: boolean;
  preferenceId?: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  error?: string;
}

/**
 * Payment status result
 */
export interface PaymentStatusResult {
  success: boolean;
  status?: PaymentStatus;
  statusDetail?: string;
  amount?: number;
  externalReference?: string;
  error?: string;
}

/**
 * Platform fee calculation result
 */
export interface PlatformFeeCalculation {
  creatorAmount: number;
  platformFee: number;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Membership pricing configuration
 */
const MEMBERSHIP_PRICES: Record<MembershipTier, Record<BillingPeriod, number>> = {
  basic: {
    monthly: 2999,
    yearly: 29990
  },
  premium: {
    monthly: 8999,
    yearly: 89990
  },
  vip: {
    monthly: 19999,
    yearly: 199990
  }
};

/**
 * Platform configuration
 */
const PLATFORM_CONFIG = {
  DEFAULT_FEE_PERCENTAGE: 0.15, // 15% platform fee
  MIN_PAYMENT_AMOUNT: 100,
  MAX_PAYMENT_AMOUNT: 999999999,
  MIN_DESCRIPTION_LENGTH: 3
};

/**
 * Sanitize string input to prevent XSS attacks
 */
const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  return input.replace(/[<>"'&]/g, '').trim();
};

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate payment data input
 */
const validatePaymentData = (paymentData: PaymentData): ValidationResult => {
  const errors: string[] = [];

  // Validate amount
  if (!paymentData.amount || typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
    errors.push('Invalid payment amount');
  }

  if (paymentData.amount > PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT) {
    errors.push('Payment amount exceeds maximum limit');
  }

  // Validate description
  if (!paymentData.description || 
      typeof paymentData.description !== 'string' || 
      paymentData.description.trim().length < PLATFORM_CONFIG.MIN_DESCRIPTION_LENGTH) {
    errors.push('Payment description is required and must be at least 3 characters');
  }

  // Validate user information
  if (!paymentData.userId || typeof paymentData.userId !== 'string') {
    errors.push('User ID is required');
  }

  if (!paymentData.userEmail || typeof paymentData.userEmail !== 'string') {
    errors.push('User email is required');
  } else if (!isValidEmail(paymentData.userEmail)) {
    errors.push('Invalid email format');
  }

  if (!paymentData.userName || typeof paymentData.userName !== 'string') {
    errors.push('User name is required');
  }

  // Validate payment type
  const validPaymentTypes: PaymentType[] = ['membership', 'collaboration', 'experience', 'campaign_deposit'];
  if (!validPaymentTypes.includes(paymentData.paymentType)) {
    errors.push('Invalid payment type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * SECURE: Create payment preference via server-side API
 * This function calls a secure server-side endpoint to create payment preferences
 */
export const createPaymentPreference = async (paymentData: PaymentData): Promise<PaymentPreferenceResult> => {
  try {
    // Validate input data
    const validation = validatePaymentData(paymentData);
    if (!validation.isValid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      };
    }

    // Sanitize input data
    const sanitizedData: PaymentData = {
      ...paymentData,
      description: sanitizeString(paymentData.description),
      userName: sanitizeString(paymentData.userName),
      userEmail: sanitizeString(paymentData.userEmail)
    };

    // Call secure server-side API endpoint
    const response = await fetch('/api/secure-payments/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      preferenceId: result.preferenceId,
      initPoint: result.initPoint,
      sandboxInitPoint: result.sandboxInitPoint
    };

  } catch (error) {
    console.error('Error creating payment preference:', error);
    return {
      success: false,
      error: 'Error creating payment preference. Please try again.'
    };
  }
};

/**
 * Create membership payment preference
 */
export const createMembershipPayment = async (membershipData: MembershipPaymentData): Promise<PaymentPreferenceResult> => {
  try {
    const amount = MEMBERSHIP_PRICES[membershipData.membershipTier][membershipData.billingPeriod];
    const description = `URContent ${membershipData.membershipTier.toUpperCase()} - ${
      membershipData.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'
    }`;

    const paymentData: PaymentData = {
      ...membershipData,
      amount,
      description,
      successUrl: `${window.location.origin}/membership/success`,
      failureUrl: `${window.location.origin}/membership/failure`,
      pendingUrl: `${window.location.origin}/membership/pending`,
      metadata: {
        membership_tier: membershipData.membershipTier,
        billing_period: membershipData.billingPeriod,
        ...membershipData.metadata
      }
    };

    return createPaymentPreference(paymentData);

  } catch (error) {
    console.error('Error creating membership payment:', error);
    return {
      success: false,
      error: 'Error creating membership payment. Please try again.'
    };
  }
};

/**
 * Create collaboration payment preference
 */
export const createCollaborationPayment = async (collaborationData: CollaborationPaymentData): Promise<PaymentPreferenceResult> => {
  try {
    const platformFeeCalculation = calculatePlatformFee(collaborationData.amount);

    const paymentData: PaymentData = {
      ...collaborationData,
      successUrl: `${window.location.origin}/collaboration/success`,
      failureUrl: `${window.location.origin}/collaboration/failure`,
      pendingUrl: `${window.location.origin}/collaboration/pending`,
      metadata: {
        collaboration_id: collaborationData.collaborationId,
        creator_id: collaborationData.creatorId,
        brand_id: collaborationData.brandId,
        creator_amount: platformFeeCalculation.creatorAmount,
        platform_fee: platformFeeCalculation.platformFee,
        ...collaborationData.metadata
      }
    };

    return createPaymentPreference(paymentData);

  } catch (error) {
    console.error('Error creating collaboration payment:', error);
    return {
      success: false,
      error: 'Error creating collaboration payment. Please try again.'
    };
  }
};

/**
 * Create experience payment preference
 */
export const createExperiencePayment = async (experienceData: ExperiencePaymentData): Promise<PaymentPreferenceResult> => {
  try {
    const paymentData: PaymentData = {
      ...experienceData,
      successUrl: `${window.location.origin}/experience/success`,
      failureUrl: `${window.location.origin}/experience/failure`,
      pendingUrl: `${window.location.origin}/experience/pending`,
      metadata: {
        experience_id: experienceData.experienceId,
        creator_id: experienceData.creatorId,
        participant_count: experienceData.participantCount,
        ...experienceData.metadata
      }
    };

    return createPaymentPreference(paymentData);

  } catch (error) {
    console.error('Error creating experience payment:', error);
    return {
      success: false,
      error: 'Error creating experience payment. Please try again.'
    };
  }
};

/**
 * Create campaign deposit payment preference
 */
export const createCampaignDepositPayment = async (depositData: CampaignDepositPaymentData): Promise<PaymentPreferenceResult> => {
  try {
    const paymentData: PaymentData = {
      ...depositData,
      successUrl: `${window.location.origin}/campaign/deposit/success`,
      failureUrl: `${window.location.origin}/campaign/deposit/failure`,
      pendingUrl: `${window.location.origin}/campaign/deposit/pending`,
      metadata: {
        campaign_id: depositData.campaignId,
        brand_id: depositData.brandId,
        deposit_type: depositData.depositType,
        ...depositData.metadata
      }
    };

    return createPaymentPreference(paymentData);

  } catch (error) {
    console.error('Error creating campaign deposit payment:', error);
    return {
      success: false,
      error: 'Error creating campaign deposit payment. Please try again.'
    };
  }
};

/**
 * SECURE: Get payment status via server-side API
 */
export const getPaymentStatus = async (paymentId: string): Promise<PaymentStatusResult> => {
  try {
    // Validate payment ID format
    if (!paymentId || typeof paymentId !== 'string' || paymentId.length < 8) {
      return {
        success: false,
        error: 'Invalid payment ID'
      };
    }

    const response = await fetch(`/api/secure-payments/status/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      status: result.status,
      statusDetail: result.statusDetail,
      amount: result.amount,
      externalReference: result.externalReference
    };

  } catch (error) {
    console.error('Error getting payment status:', error);
    return {
      success: false,
      error: 'Error retrieving payment status'
    };
  }
};

/**
 * Format currency for display (Argentine Peso)
 */
export const formatCurrency = (amount: number): string => {
  // Input validation
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount)); // Use absolute value to prevent negative currency display
};

/**
 * Calculate platform fee split
 */
export const calculatePlatformFee = (
  amount: number, 
  feePercentage: number = PLATFORM_CONFIG.DEFAULT_FEE_PERCENTAGE
): PlatformFeeCalculation => {
  // Input validation
  if (typeof amount !== 'number' || 
      amount < 0 || 
      typeof feePercentage !== 'number' || 
      feePercentage < 0 || 
      feePercentage > 1) {
    return {
      creatorAmount: 0,
      platformFee: 0
    };
  }

  const platformFee = amount * feePercentage;
  const creatorAmount = amount - platformFee;

  return {
    creatorAmount: Math.round(creatorAmount),
    platformFee: Math.round(platformFee)
  };
};

/**
 * Validate payment amount within acceptable limits
 */
export const validatePaymentAmount = (
  amount: number, 
  minAmount: number = PLATFORM_CONFIG.MIN_PAYMENT_AMOUNT
): boolean => {
  return typeof amount === 'number' && 
         !isNaN(amount) && 
         amount >= minAmount && 
         amount <= PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT;
};

/**
 * Get available installment options based on payment amount
 */
export const getInstallmentOptions = (amount: number): number[] => {
  if (!validatePaymentAmount(amount)) {
    return [1];
  }

  // Installment options based on amount ranges
  if (amount >= 50000) return [1, 3, 6, 9, 12];
  if (amount >= 20000) return [1, 3, 6, 9];
  if (amount >= 10000) return [1, 3, 6];
  if (amount >= 5000) return [1, 3];
  
  return [1];
};

/**
 * Get membership price for given tier and billing period
 */
export const getMembershipPrice = (tier: MembershipTier, period: BillingPeriod): number => {
  return MEMBERSHIP_PRICES[tier][period];
};

/**
 * Get all available membership tiers
 */
export const getMembershipTiers = (): MembershipTier[] => {
  return Object.keys(MEMBERSHIP_PRICES) as MembershipTier[];
};

/**
 * Get discount percentage for yearly billing
 */
export const getYearlyDiscount = (tier: MembershipTier): number => {
  const monthlyPrice = MEMBERSHIP_PRICES[tier].monthly;
  const yearlyPrice = MEMBERSHIP_PRICES[tier].yearly;
  const yearlyMonthlyEquivalent = monthlyPrice * 12;
  
  return Math.round(((yearlyMonthlyEquivalent - yearlyPrice) / yearlyMonthlyEquivalent) * 100);
};

// Default export with all main functions
export default {
  // Payment creation functions
  createPaymentPreference,
  createMembershipPayment,
  createCollaborationPayment,
  createExperiencePayment,
  createCampaignDepositPayment,
  
  // Payment status and utilities
  getPaymentStatus,
  formatCurrency,
  calculatePlatformFee,
  validatePaymentAmount,
  getInstallmentOptions,
  
  // Membership utilities
  getMembershipPrice,
  getMembershipTiers,
  getYearlyDiscount,
  
  // Configuration
  getPublicKey
};