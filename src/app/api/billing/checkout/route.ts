import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const planId = process.env.RAZORPAY_PLAN_ID;

    // 2. Developer Sandbox Fallback
    // If Razorpay keys are not configured, bypass and upgrade directly for local testing.
    if (!keyId || !keySecret || !planId) {
      // By-pass payment and set is_pro to true directly using admin client (bypasses RLS)
      const supabaseAdmin = createAdminClient();
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_pro: true })
        .eq('id', user.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ url: '/dashboard?upgrade=success' });
    }

    // 3. Real Razorpay Subscription Setup
    const authString = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 600, // 50 years of billing cycles
        quantity: 1,
        customer_notify: 1,
        notes: {
          userId: user.id
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.description || 'Razorpay subscription creation failed');
    }

    // Return the hosted payment checkout url
    return NextResponse.json({ url: data.short_url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
