import { NextResponse } from 'next/server';
import { createClient as createSupabaseDirect } from '@supabase/supabase-js';
import Stripe from 'stripe';

const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: '2025-01-27.acac' as any,
  });
};

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Create an admin Supabase client using the Service Role Key to bypass RLS policies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabaseAdmin = createSupabaseDirect(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const session = event.data.object as any;

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.userId;
    if (userId) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to update user billing status on checkout', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerEmail = session.customer_details?.email || session.email;
    if (customerEmail) {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false })
        .eq('email', customerEmail);

      if (error) {
        console.error('Failed to revoke billing status on cancellation', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
