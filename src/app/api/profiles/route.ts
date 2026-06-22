import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch all profiles owned by user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profiles, error } = await supabase
      .from('brand_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new brand profile
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, tone, audience, product_desc, avoid_words } = body;

    // Validation
    if (!name || !tone || !audience || !product_desc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check current month profile limits (Free limit check: 5 max profiles)
    const { count, error: countError } = await supabase
      .from('brand_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // Check if user has premium status in profile metadata (to bypass 5-limit profiles CRUD)
    const { data: profileMeta, error: metaError } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    const isPro = !metaError && profileMeta?.is_pro;

    if (!isPro && count !== null && count >= 5) {
      return NextResponse.json(
        { error: 'Profile limit reached. Free accounts are limited to 5 brand profiles.' },
        { status: 403 }
      );
    }

    // Insert new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('brand_profiles')
      .insert({
        user_id: user.id,
        name,
        tone,
        audience,
        product_desc,
        avoid_words: avoid_words || '',
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: newProfile }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
