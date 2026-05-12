import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const stripe = getStripe()
  const supabase = getServiceClient()
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      if (!userId) break

      await supabase.from('subscriptions').update({
        plan: 'pro',
        status: 'active',
        stripe_subscription_id: session.subscription as string,
      }).eq('user_id', userId)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break
      const userId = (customer as Stripe.Customer).metadata?.supabase_user_id
      if (!userId) break

      const plan = sub.status === 'active' ? 'pro' : 'free'
      await supabase.from('subscriptions').update({
        plan,
        status: sub.status,
        stripe_subscription_id: sub.id,
        current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const customer = await stripe.customers.retrieve(sub.customer as string)
      if (customer.deleted) break
      const userId = (customer as Stripe.Customer).metadata?.supabase_user_id
      if (!userId) break

      await supabase.from('subscriptions').update({
        plan: 'free',
        status: 'canceled',
        stripe_subscription_id: null,
      }).eq('user_id', userId)
      break
    }
  }

  return NextResponse.json({ received: true })
}
