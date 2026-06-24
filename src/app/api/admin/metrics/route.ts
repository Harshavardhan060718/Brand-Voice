import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    // 1. Authenticate and Authorize User
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query profiles directly to check if they are an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch platform statistics using the Admin Client (service-role key)
    const supabaseAdmin = createAdminClient();

    // Total Users
    const { count: totalUsers, error: usersErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (usersErr) throw new Error(usersErr.message);

    // Pro Users
    const { count: proUsers, error: proErr } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_pro', true);

    if (proErr) throw new Error(proErr.message);

    // Total Brand Profiles
    const { count: totalBrands, error: brandsErr } = await supabaseAdmin
      .from('brand_profiles')
      .select('*', { count: 'exact', head: true });

    if (brandsErr) throw new Error(brandsErr.message);

    // Total Generations
    const { count: totalGenerations, error: generationsErr } = await supabaseAdmin
      .from('generations')
      .select('*', { count: 'exact', head: true });

    if (generationsErr) throw new Error(generationsErr.message);

    // 3. Return dashboard data
    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
        proUsers: proUsers || 0,
        totalBrands: totalBrands || 0,
        totalGenerations: totalGenerations || 0,
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
