import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Query Profiles count (owned by user)
    const { count: profilesCount, error: profilesError } = await supabase
      .from('brand_profiles')
      .select('*', { count: 'exact', head: true });

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    // 3. Query Total Generations count
    const { count: totalGenerations, error: generationsError } = await supabase
      .from('generations')
      .select('*', { count: 'exact', head: true });

    if (generationsError) {
      return NextResponse.json({ error: generationsError.message }, { status: 500 });
    }

    // 4. Query current month usage
    const currentDate = new Date();
    const currentMonthStr = currentDate.toISOString().substring(0, 7); // Format: YYYY-MM
    
    const { data: usageData, error: usageError } = await supabase
      .from('usage')
      .select('count')
      .eq('month', currentMonthStr)
      .maybeSingle();

    if (usageError) {
      return NextResponse.json({ error: usageError.message }, { status: 500 });
    }
    
    const usageCount = usageData ? usageData.count : 0;

    // 5. Query user subscription metadata
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_pro, is_admin')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    const isPro = userProfile ? userProfile.is_pro : false;
    const isAdmin = userProfile ? userProfile.is_admin : false;

    // 6. Fetch 5 most recent generations joined with brand profile name
    const { data: recentGenerations, error: recentError } = await supabase
      .from('generations')
      .select(`
        id,
        content_type,
        prompt_used,
        output,
        created_at,
        brand_profiles (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      return NextResponse.json({ error: recentError.message }, { status: 500 });
    }

    // 7. Calculate days remaining until first of next calendar month (reset)
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const diffTime = Math.abs(nextMonth.getTime() - currentDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Map outputs to a flat structure for frontend rendering
    const formattedGenerations = (recentGenerations || []).map((g: any) => ({
      id: g.id,
      contentType: g.content_type,
      promptUsed: g.prompt_used,
      output: g.output,
      createdAt: g.created_at,
      brandName: g.brand_profiles ? g.brand_profiles.name : 'Unknown Brand'
    }));

    return NextResponse.json({
      metrics: {
        profilesCount: profilesCount || 0,
        totalGenerations: totalGenerations || 0,
        usageCount,
        isPro,
        isAdmin,
        email: user.email || 'user@example.com',
        daysUntilReset: diffDays,
        recentGenerations: formattedGenerations
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
