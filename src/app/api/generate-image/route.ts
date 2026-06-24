import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client using the secret key stored in .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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
    const { prompt } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Missing prompt parameter.' }, { status: 400 });
    }

    // 3. Generate Image using OpenAI (with DALL-E 3 and automatic DALL-E 2 fallback)
    let imageUrl = '';
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
      });
      imageUrl = response.data?.[0]?.url || '';
    } catch (dalle3Error: any) {
      console.warn('DALL-E 3 is not available on this account tier. Falling back to DALL-E 2:', dalle3Error);
      
      // Fallback to DALL-E 2 (512x512 resolution, which has wider availability)
      const response = await openai.images.generate({
        model: 'dall-e-2',
        prompt: prompt,
        n: 1,
        size: '512x512',
      });
      imageUrl = response.data?.[0]?.url || '';
    }

    if (!imageUrl) {
      throw new Error('DALL-E did not return any image URL.');
    }

    // 4. Return the hosted image URL
    return NextResponse.json({ url: imageUrl });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
