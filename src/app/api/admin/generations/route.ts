import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // 1. Authenticate and Authorize
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if caller is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch generation records from view using Admin Client
    const supabaseAdmin = createAdminClient();
    const { data: generations, error: genError } = await supabaseAdmin
      .from('admin_generations_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (genError) {
      return NextResponse.json({ error: genError.message }, { status: 500 });
    }

    return NextResponse.json({ generations: generations || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
