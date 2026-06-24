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

    // Check if user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch User statistics from view
    const supabaseAdmin = createAdminClient();
    const { data: userStats, error: statsError } = await supabaseAdmin
      .from('admin_user_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    return NextResponse.json({ users: userStats || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
