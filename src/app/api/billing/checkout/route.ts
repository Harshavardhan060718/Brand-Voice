import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acac' as any, // Standard API version placeholder
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Developer Sandbox Fallback
    // If Stripe credentials are not set, immediately upgrade user in database and return redirect.
    if (!process.env.STRIPE_SECRET_KEY) {
      // By-pass stripe and set is_pro to true directly
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ url: '/dashboard?upgrade=success' });
    }

    // 3. Real Stripe Checkout Setup
    const { origin } = new URL(request.url);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'BrandVoice Pro Plan',
              description: 'Unlimited AI content generations and brand profiles.',
            },
            unit_amount: 1900, // $19.00 USD
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?upgrade=success`,
      cancel_url: `${origin}/dashboard?upgrade=cancel`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
