import { NextResponse } from 'next/server';
import { createClient as createSupabaseDirect } from '@supabase/supabase-js';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature') || '';
    const body = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
    }

    // 1. Verify Razorpay Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // 2. Initialize Admin Supabase Client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createSupabaseDirect(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const subscription = event.payload?.subscription?.entity;
    const userId = subscription?.notes?.userId;

    if (!userId) {
      // Return 200 to acknowledge the event if notes or userId is not relevant (e.g. system tests)
      return NextResponse.json({ received: true, info: 'No user ID in event notes' });
    }

    // 3. Process Events
    // subscription.charged - when billing is successful
    if (event.event === 'subscription.charged') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to upgrade billing status on subscription charge', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // subscription.cancelled or subscription.halted - when cancelled
    if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false })
        .eq('id', userId);

      if (error) {
        console.error('Failed to revoke billing status on subscription cancel', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
