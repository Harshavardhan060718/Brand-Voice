import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Request Body
    const body = await request.json();
    const { generationId, rating, comment } = body;

    if (!generationId || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Missing or invalid parameters. Rating must be between 1 and 5.' },
        { status: 400 }
      );
    }

    // 3. Verify that the generation belongs to this user
    const { data: generation, error: genError } = await supabase
      .from('generations')
      .select('id')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (genError || !generation) {
      return NextResponse.json(
        { error: 'Generation record not found or access denied.' },
        { status: 404 }
      );
    }

    // 4. Insert feedback
    const { error: insertError } = await supabase
      .from('generation_feedback')
      .insert({
        user_id: user.id,
        generation_id: generationId,
        rating,
        comment: comment?.trim() || null
      });

    if (insertError) {
      console.error('Error inserting generation feedback:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Feedback API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
