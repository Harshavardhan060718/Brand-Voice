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
    const { prompt } = body;

    if (!prompt || prompt.trim() === '') {
      return NextResponse.json({ error: 'Missing prompt parameter.' }, { status: 400 });
    }

    const hfToken = process.env.HF_ACCESS_TOKEN;

    // 3. Sandbox Mode Fallback
    if (!hfToken) {
      // Return a beautiful generic creative visual placeholder if no token is configured
      const placeholderUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
      return NextResponse.json({ url: placeholderUrl, isSandbox: true });
    }

    // 4. Call Hugging Face Inference API for FLUX.1-schnell
    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
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
        // Hugging Face sometimes returns model loading alerts (estimated_time)
        errMsg = errJson.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    // 5. Convert Image Buffer to Base64 Data URL
    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ url: dataUrl });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
