// MercadoPago Configuration and Service
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// MercadoPago Credentials
export const MERCADOPAGO_CONFIG = {
  publicKey: 'APP_USR-4bf8a6c3-d4dc-49c5-ac76-3521ae177c65',
  accessToken: 'APP_USR-932682478526432-072600-09dd6280a56b305123226077353cecd8-239559910',
  clientId: '932682478526432',
  clientSecret: 'MRk4tMDSU9XHqYOzbbAVzEb2RgEl12oC'
};

// Initialize MercadoPago client
const client = new MercadoPagoConfig({ 
  accessToken: MERCADOPAGO_CONFIG.accessToken,
  options: { timeout: 5000 }
});

export const payment = new Payment(client);
export const preference = new Preference(client);

// Payment types
export type PaymentType = 'membership' | 'collaboration' | 'experience' | 'campaign_deposit';

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

export interface MembershipPaymentData extends PaymentData {
  membershipTier: 'basic' | 'premium' | 'vip';
  billingPeriod: 'monthly' | 'yearly';
}

export interface CollaborationPaymentData extends PaymentData {
  collaborationId: string;
  creatorId: string;
  brandId: string;
  paymentSplit?: {
    creatorAmount: number;
    platformFee: number;
  };
}

// Create payment preference
export const createPaymentPreference = async (paymentData: PaymentData) => {
  try {
    const preferenceData = {
      items: [
        {
          id: `${paymentData.paymentType}_${Date.now()}`,
          title: paymentData.description,
          quantity: 1,
          unit_price: paymentData.amount,
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: paymentData.userName,
        email: paymentData.userEmail
      },
      payment_methods: {
        default_payment_method_id: null,
        excluded_payment_types: [
          { id: 'ticket' }
        ],
        excluded_payment_methods: [],
        installments: paymentData.amount > 10000 ? 12 : 6,
        default_installments: 1
      },
      shipments: {
        cost: 0,
        mode: 'not_specified'
      },
      back_urls: {
        success: paymentData.successUrl || `${window.location.origin}/payment/success`,
        failure: paymentData.failureUrl || `${window.location.origin}/payment/failure`,
        pending: paymentData.pendingUrl || `${window.location.origin}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `${paymentData.paymentType}_${paymentData.userId}_${Date.now()}`,
      notification_url: `${window.location.origin}/api/mercadopago/webhook`,
      metadata: {
        user_id: paymentData.userId,
        payment_type: paymentData.paymentType,
        ...paymentData.metadata
      }
    };

    const response = await preference.create({ body: preferenceData });
    return {
      success: true,
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point
    };
  } catch (error) {
    console.error('Error creating MercadoPago preference:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error creating payment preference'
    };
  }
};

// Create membership payment
export const createMembershipPayment = async (membershipData: MembershipPaymentData) => {
  const membershipPrices = {
    basic: { monthly: 2999, yearly: 29990 },
    premium: { monthly: 8999, yearly: 89990 },
    vip: { monthly: 19999, yearly: 199990 }
  };

  const amount = membershipPrices[membershipData.membershipTier][membershipData.billingPeriod];
  const description = `URContent ${membershipData.membershipTier.toUpperCase()} - ${membershipData.billingPeriod === 'monthly' ? 'Mensual' : 'Anual'}`;

  return createPaymentPreference({
    ...membershipData,
    amount,
    description,
    successUrl: `${window.location.origin}/membership/success`,
    failureUrl: `${window.location.origin}/membership/failure`,
    metadata: {
      membership_tier: membershipData.membershipTier,
      billing_period: membershipData.billingPeriod
    }
  });
};

// Create collaboration payment
export const createCollaborationPayment = async (collaborationData: CollaborationPaymentData) => {
  const platformFeePercentage = 0.15; // 15% platform fee
  const creatorAmount = collaborationData.amount * (1 - platformFeePercentage);
  const platformFee = collaborationData.amount * platformFeePercentage;

  return createPaymentPreference({
    ...collaborationData,
    successUrl: `${window.location.origin}/collaboration/success`,
    failureUrl: `${window.location.origin}/collaboration/failure`,
    metadata: {
      collaboration_id: collaborationData.collaborationId,
      creator_id: collaborationData.creatorId,
      brand_id: collaborationData.brandId,
      creator_amount: creatorAmount,
      platform_fee: platformFee
    }
  });
};

// Process payment webhook
export const processPaymentWebhook = async (data: any) => {
  try {
    if (data.type === 'payment') {
      const paymentId = data.data.id;
      const paymentInfo = await payment.get({ id: paymentId });
      
      return {
        success: true,
        payment: paymentInfo,
        status: paymentInfo.status,
        externalReference: paymentInfo.external_reference
      };
    }
    
    return { success: false, error: 'Invalid webhook type' };
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error processing webhook' 
    };
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId: string) => {
  try {
    const paymentInfo = await payment.get({ id: paymentId });
    return {
      success: true,
      status: paymentInfo.status,
      statusDetail: paymentInfo.status_detail,
      amount: paymentInfo.transaction_amount,
      externalReference: paymentInfo.external_reference
    };
  } catch (error) {
    console.error('Error getting payment status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error getting payment status'
    };
  }
};

// Payment status types
export type PaymentStatus = 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled';

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate platform fee
export const calculatePlatformFee = (amount: number, feePercentage: number = 0.15): { creatorAmount: number; platformFee: number } => {
  const platformFee = amount * feePercentage;
  const creatorAmount = amount - platformFee;
  
  return {
    creatorAmount: Math.round(creatorAmount),
    platformFee: Math.round(platformFee)
  };
};

// Validate payment amount
export const validatePaymentAmount = (amount: number, minAmount: number = 100): boolean => {
  return amount >= minAmount && amount <= 999999999;
};

// Create installment options
export const getInstallmentOptions = (amount: number) => {
  if (amount >= 50000) return [1, 3, 6, 9, 12];
  if (amount >= 20000) return [1, 3, 6, 9];
  if (amount >= 10000) return [1, 3, 6];
  if (amount >= 5000) return [1, 3];
  return [1];
};

export default {
  createPaymentPreference,
  createMembershipPayment,
  createCollaborationPayment,
  processPaymentWebhook,
  getPaymentStatus,
  formatCurrency,
  calculatePlatformFee,
  validatePaymentAmount,
  getInstallmentOptions
};