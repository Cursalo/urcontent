import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleSubscriptionCreated(session)
        break

      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  if (!userId) return

  try {
    // Create subscription record
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_at: new Date().toISOString()
      })

    // Update user's subscription status
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'active',
        subscription_tier: session.metadata?.plan || 'pro'
      })
      .eq('id', userId)

    console.log(`Subscription created for user ${userId}`)
  } catch (error) {
    console.error('Error creating subscription:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    console.log(`Subscription updated: ${subscription.id}`)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    // Update user status
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single()

    if (sub) {
      await supabase
        .from('users')
        .update({ subscription_status: 'canceled' })
        .eq('id', sub.user_id)
    }

    console.log(`Subscription canceled: ${subscription.id}`)
  } catch (error) {
    console.error('Error canceling subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    // Log successful payment
    await supabase
      .from('payments')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription as string,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: 'succeeded',
        paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
        created_at: new Date().toISOString()
      })

    console.log(`Payment succeeded: ${invoice.id}`)
  } catch (error) {
    console.error('Error logging payment:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    // Log failed payment
    await supabase
      .from('payments')
      .insert({
        stripe_invoice_id: invoice.id,
        stripe_subscription_id: invoice.subscription as string,
        amount: invoice.amount_due,
        currency: invoice.currency,
        status: 'failed',
        created_at: new Date().toISOString()
      })

    // Update subscription status if needed
    if (invoice.subscription) {
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', invoice.subscription as string)
    }

    console.log(`Payment failed: ${invoice.id}`)
  } catch (error) {
    console.error('Error logging failed payment:', error)
  }
}