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

    // 2. Parse Request Body
    const body = await request.json();
    const { prompt, generationId } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Missing prompt parameter.' }, { status: 400 });
    }

    const hfToken = process.env.HF_ACCESS_TOKEN;

    // 3. Sandbox Mode Fallback
    if (!hfToken) {
      // Return a beautiful generic creative visual placeholder if no token is configured
      const placeholderUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
      
      if (generationId) {
        const supabaseAdmin = createAdminClient();
        await supabaseAdmin
          .from('generations')
          .update({ image_url: placeholderUrl })
          .eq('id', generationId);
      }
      
      return NextResponse.json({ url: placeholderUrl, isSandbox: true });
    }

    // 4. Call Hugging Face Inference API for FLUX.1-schnell (Disable cache and use fresh generation)
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
          'x-use-cache': 'false'
        },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = 'Failed to generate image via Hugging Face.';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    // 5. Upload Image Buffer to Supabase Storage
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const bucketName = `user-images-${user.id}`;
    const supabaseAdmin = createAdminClient();

    // Ensure user-specific bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);

    if (!bucketExists) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png']
      });
      if (createBucketError) {
        console.error('Failed to create user storage bucket:', createBucketError);
        throw new Error('Failed to configure storage for user images.');
      }
    }

    const fileName = `${generationId || 'image'}-${Date.now()}.jpg`;
    
    // Upload file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error('Failed to save generated image to user storage.');
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    const publicUrl = publicUrlData.publicUrl;

    // Update database log with the image URL if generationId is present
    if (generationId) {
      const { error: updateDbError } = await supabaseAdmin
        .from('generations')
        .update({ image_url: publicUrl })
        .eq('id', generationId);
      
      if (updateDbError) {
        console.error('Failed to update image_url in generations table:', updateDbError);
      }
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

