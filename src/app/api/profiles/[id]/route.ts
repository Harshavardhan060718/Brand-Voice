import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PUT: Update an existing brand profile
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, tone, audience, product_desc, avoid_words } = body;

    // Validation
    if (!name || !tone || !audience || !product_desc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update profile (Supabase RLS secures that user owns this ID)
    const { data: updatedProfile, error: updateError } = await supabase
      .from('brand_profiles')
      .update({
        name,
        tone,
        audience,
        product_desc,
        avoid_words: avoid_words || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Remove an existing brand profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete profile (RLS handles checks, and PostgreSQL cascade deletes generations)
    const { error: deleteError } = await supabase
      .from('brand_profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
