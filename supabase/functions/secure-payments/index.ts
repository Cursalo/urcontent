import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// MercadoPago server-side configuration
const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const WEBHOOK_SECRET = Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')!

interface PaymentRequest {
  amount: number;
  description: string;
  paymentType: 'membership' | 'collaboration' | 'experience';
  userId: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid token')
    }

    const { pathname } = new URL(req.url)
    
    switch (pathname) {
      case '/create-preference':
        return await handleCreatePreference(req, supabase, user)
      case '/webhook':
        return await handleWebhook(req, supabase)
      case '/payment-status':
        return await handlePaymentStatus(req, supabase, user)
      default:
        return new Response('Not Found', { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    console.error('Payment service error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCreatePreference(req: Request, supabase: any, user: any) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const paymentData: PaymentRequest = await req.json()

  // Validate payment data
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid payment amount')
  }

  if (!paymentData.description || paymentData.description.length < 3) {
    throw new Error('Invalid payment description')
  }

  // Verify user owns the payment
  if (paymentData.userId !== user.id) {
    throw new Error('Unauthorized payment request')
  }

  // Create MercadoPago preference
  const preferenceData = {
    items: [{
      id: `${paymentData.paymentType}_${Date.now()}`,
      title: paymentData.description,
      quantity: 1,
      unit_price: paymentData.amount,
      currency_id: 'ARS'
    }],
    payer: {
      name: user.user_metadata?.full_name || user.email,
      email: user.email
    },
    payment_methods: {
      excluded_payment_types: [{ id: 'ticket' }],
      installments: paymentData.amount > 10000 ? 12 : 6,
      default_installments: 1
    },
    back_urls: {
      success: `${Deno.env.get('FRONTEND_URL')}/payment/success`,
      failure: `${Deno.env.get('FRONTEND_URL')}/payment/failure`,
      pending: `${Deno.env.get('FRONTEND_URL')}/payment/pending`
    },
    auto_return: 'approved',
    external_reference: `${paymentData.paymentType}_${user.id}_${Date.now()}`,
    notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/secure-payments/webhook`,
    metadata: {
      user_id: user.id,
      payment_type: paymentData.paymentType,
      ...paymentData.metadata
    }
  }

  // Call MercadoPago API
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preferenceData)
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('MercadoPago API error:', error)
    throw new Error('Payment preference creation failed')
  }

  const preference = await response.json()

  // Store transaction record
  const { error: dbError } = await supabase
    .from('transactions')
    .insert({
      collaboration_id: paymentData.metadata?.collaboration_id,
      payer_id: user.id,
      payee_id: paymentData.metadata?.payee_id,
      amount: paymentData.amount,
      currency: 'ARS',
      status: 'pending',
      external_payment_id: preference.id,
      description: paymentData.description,
      metadata: paymentData.metadata
    })

  if (dbError) {
    console.error('Database error:', dbError)
    // Don't fail the request, but log the error
  }

  return new Response(
    JSON.stringify({
      success: true,
      preferenceId: preference.id,
      initPoint: preference.init_point
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWebhook(req: Request, supabase: any) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  const body = await req.text()
  const signature = req.headers.get('x-signature')
  
  // Verify webhook signature (implement signature verification)
  // This is crucial for security
  
  const webhookData = JSON.parse(body)
  
  if (webhookData.type === 'payment') {
    const paymentId = webhookData.data.id
    
    // Get payment details from MercadoPago
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment details')
    }
    
    const payment = await response.json()
    
    // Update transaction in database
    const { error } = await supabase
      .from('transactions')
      .update({
        status: payment.status,
        completed_at: payment.status === 'approved' ? new Date().toISOString() : null,
        metadata: {
          ...payment.metadata,
          mercadopago_payment_id: payment.id,
          payment_method: payment.payment_method_id,
          status_detail: payment.status_detail
        }
      })
      .eq('external_payment_id', payment.external_reference)
    
    if (error) {
      console.error('Error updating transaction:', error)
    }
    
    // Handle successful payment
    if (payment.status === 'approved') {
      await processSuccessfulPayment(supabase, payment)
    }
  }

  return new Response('OK', { headers: corsHeaders })
}

async function handlePaymentStatus(req: Request, supabase: any, user: any) {
  const url = new URL(req.url)
  const paymentId = url.searchParams.get('payment_id')
  
  if (!paymentId) {
    throw new Error('Payment ID required')
  }

  // Verify user has access to this payment
  const { data: transaction, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('external_payment_id', paymentId)
    .eq('payer_id', user.id)
    .single()

  if (error || !transaction) {
    throw new Error('Payment not found or access denied')
  }

  return new Response(
    JSON.stringify({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        description: transaction.description,
        created_at: transaction.created_at,
        completed_at: transaction.completed_at
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function processSuccessfulPayment(supabase: any, payment: any) {
  const metadata = payment.metadata
  
  switch (metadata.payment_type) {
    case 'membership':
      await handleMembershipPayment(supabase, payment, metadata)
      break
    case 'collaboration':
      await handleCollaborationPayment(supabase, payment, metadata)
      break
    case 'experience':
      await handleExperiencePayment(supabase, payment, metadata)
      break
  }
}

async function handleMembershipPayment(supabase: any, payment: any, metadata: any) {
  // Create or update membership record
  const { error } = await supabase
    .from('memberships')
    .upsert({
      user_id: metadata.user_id,
      tier: metadata.membership_tier,
      status: 'active',
      price_ars: payment.transaction_amount,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + (metadata.billing_period === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
      external_subscription_id: payment.id
    })
  
  if (error) {
    console.error('Error updating membership:', error)
  }
}

async function handleCollaborationPayment(supabase: any, payment: any, metadata: any) {
  // Update collaboration status and handle escrow
  const { error } = await supabase
    .from('collaborations')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString()
    })
    .eq('id', metadata.collaboration_id)
  
  if (error) {
    console.error('Error updating collaboration:', error)
  }
}

async function handleExperiencePayment(supabase: any, payment: any, metadata: any) {
  // Handle experience/venue booking confirmation
  // Implementation depends on specific business logic
}