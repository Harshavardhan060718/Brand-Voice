import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Fetch user's historical generations with pagination and filters
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const profileId = searchParams.get('profileId');
    const contentType = searchParams.get('contentType');

    const offset = (page - 1) * limit;

    // Start query
    let query = supabase
      .from('generations')
      .select(`
        id,
        content_type,
        prompt_used,
        output,
        image_url,
        created_at,
        brand_profiles (
          id,
          name
        )
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (profileId) {
      query = query.eq('profile_id', profileId);
    }
    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    // Apply pagination and ordering
    const { data: generations, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Format output structure
    const formatted = (generations || []).map((g: any) => ({
      id: g.id,
      contentType: g.content_type,
      promptUsed: g.prompt_used,
      output: g.output,
      imageUrl: g.image_url,
      createdAt: g.created_at,
      brandName: g.brand_profiles ? g.brand_profiles.name : 'Unknown Brand',
      profileId: g.brand_profiles ? g.brand_profiles.id : ''
    }));

    return NextResponse.json({
      generations: formatted,
      pagination: {
        page,
        limit,
        totalItems: count || 0,
        totalPages
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
