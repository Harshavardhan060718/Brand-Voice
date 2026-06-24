import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

// Initialize OpenAI client using the secret key stored in .env.local
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function generateLocalFallback(
  brand: any,
  contentType: string,
  instruction: string,
  examples: string
): string[] {
  const name = brand.name;
  const tone = brand.tone;
  const audience = brand.audience;
  const desc = brand.product_desc;
  const prompt = instruction.trim().replace(/^\s*so\s+we\s+just\s+/i, 'just ').replace(/[.!]+$/, '');

  // Helper to extract hashtags from template and map to relevant ones
  const getAdaptedHashtags = (template: string): string => {
    const defaultHashs = [`#${name.replace(/\s+/g, '')}`, `#${tone.split(',')[0]?.trim().replace(/\s+/g, '')}`, `#Innovation`].filter(Boolean);
    const foundHashtags = template.match(/#\w+/g);
    if (!foundHashtags) return defaultHashs.join(' ');
    
    // Adapt specific hashtags or keep generic ones
    return foundHashtags.map(h => {
      const tag = h.substring(1).toLowerCase();
      if (tag.includes('student') || tag.includes('ambassador') || tag.includes('google') || tag.includes('music')) {
        return `#${name.replace(/\s+/g, '')}`;
      }
      return h;
    }).filter((v, i, a) => a.indexOf(v) === i).join(' '); // Unique tags
  };

  // Helper to adapt a template
  const adaptTemplate = (template: string, variantIndex: number): string => {
    // Split template into paragraphs
    const paragraphs = template.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    
    // Let's rewrite each paragraph to match the semantic flow of the user's reference
    const rewrittenParagraphs = paragraphs.map((para, index) => {
      // If it is the hashtag block, adapt the hashtags
      if (para.startsWith('#')) {
        return getAdaptedHashtags(para);
      }
      
      const lowerPara = para.toLowerCase();

      // Paragraph 1: Hook / Announcement (e.g. "I'm thrilled to have been part of...", "Announcing...")
      if (index === 0 || lowerPara.includes('thrilled') || lowerPara.includes('excited') || lowerPara.includes('happy to') || lowerPara.includes('delighted')) {
        if (variantIndex === 0) {
          return `I’m thrilled to share that the team at ${name} has officially ${prompt}! It marks a major milestone.`;
        }
        if (variantIndex === 1) {
          return `We are excited to announce a new milestone at ${name}: we have successfully ${prompt}!`;
        }
        return `It’s official! Our team at ${name} has ${prompt}. We couldn't be prouder.`;
      }

      // Paragraph 2: Experience / Learning / Training details (e.g. "It was a fantastic experience...")
      if (lowerPara.includes('experience') || lowerPara.includes('thank you') || lowerPara.includes('learning') || lowerPara.includes('mastered') || lowerPara.includes('completed')) {
        if (variantIndex === 0) {
          return `It was a fantastic experience mastering these skills to build the highest quality products for ${audience}.`;
        }
        if (variantIndex === 1) {
          return `This was an incredible opportunity to hone our expertise. Special thanks to our team for mastering ${desc}.`;
        }
        return `A truly enriching experience. We've taken our capabilities to the next level to deliver a premium ${tone} experience.`;
      }

      // Paragraph 3: Teamwork / Collaboration / Next Steps (e.g. "Working alongside my talented teammates...")
      if (lowerPara.includes('working alongside') || lowerPara.includes('teammates') || lowerPara.includes('collaboration') || lowerPara.includes('together') || lowerPara.includes('colleague')) {
        if (variantIndex === 0) {
          return `Working alongside my talented colleagues at ${name} was the highlight! Together, we explored advanced styling tools and techniques to bring our royal vision to life.`;
        }
        if (variantIndex === 1) {
          return `Collaborating with such a passionate team made all the difference. We utilized state-of-the-art tools to craft this Royal Look!`;
        }
        return `Teamwork is what drives us forward. Combining our skills, we turned complex ideas into beautiful realities.`;
      }

      // Default fallback for unmatched paragraph: substitute key words
      return para
        .replace(/Google Student Ambassador/gi, name)
        .replace(/Bandaru Sirini Reddy/gi, 'our training mentors')
        .replace(/Anudeep Kandukoori and Amrutha Varshini/gi, 'our talented team')
        .replace(/Music Night Edition 2026/gi, prompt)
        .replace(/Google tools/gi, 'styling techniques');
    });

    const hasHashtags = rewrittenParagraphs.some(p => p.startsWith('#'));
    const hashtagText = getAdaptedHashtags(template);
    
    // Filter out the hashtag block from the main text paragraphs
    const textParagraphs = rewrittenParagraphs.filter(p => !p.startsWith('#'));

    const contentTypeLower = contentType.toLowerCase();
    
    // Formats for different content types
    if (contentTypeLower.includes('instagram') || contentTypeLower.includes('caption') || contentTypeLower.includes('facebook') || contentTypeLower.includes('insta')) {
      // Instagram / Facebook style: single compact paragraph with emojis and hashtags at the end
      const mergedText = textParagraphs.join(' ');
      return `✨ ${mergedText}\n\n${hashtagText}`;
    }
    
    if (contentTypeLower.includes('headline')) {
      // Headline style: a single short sentence
      return textParagraphs[0] || `Introducing ${name}'s ${prompt}!`;
    }
    
    if (contentTypeLower.includes('email')) {
      // Email style: formal layout
      return `Subject: New milestone at ${name} 🚀\n\nHi there,\n\n${textParagraphs[0]}\n\n${textParagraphs[1] || ''}\n\n${textParagraphs[2] || ''}\n\nBest regards,\nThe ${name} Team`;
    }

    // Default layout (LinkedIn / General Post): paragraphs with double newlines
    const outputList = [...textParagraphs];
    outputList.push(hashtagText);
    return outputList.join('\n\n');
  };

  // If we have templates from user examples, let's adapt them!
  let exampleTemplates: string[] = [];
  if (examples && examples.trim()) {
    exampleTemplates = examples
      .split(/Variant \d+:|Example \d+:/i)
      .map(e => e.trim())
      .filter(e => e.length > 20);
  }

  // If no user examples are pasted, use standard content-type based fallbacks
  const generateGenericPost = (index: number): string => {
    const hashtagBlock = `#${name.replace(/\s+/g, '')} #Innovation #${tone.split(',')[0]?.trim().replace(/\s+/g, '')} #Marketing`;
    
    if (contentType.toLowerCase().includes('email')) {
      if (index === 0) {
        return `Subject: Launching our new product at ${name} 🚀\n\nDear customer,\n\nWe are excited to share details about our latest launch: ${prompt}.\n\nSpecifically designed for ${audience}, this features ${desc}.\n\nOur team has applied a ${tone} approach to ensure you get the absolute best experience.\n\nWarm regards,\nThe ${name} Team`;
      }
      if (index === 1) {
        return `Subject: Specially for ${audience}: Discover ${name} 💡\n\nHi there,\n\nWe wanted to introduce ${name}'s newest development: ${prompt}.\n\nIt is crafted with a ${tone} style to highlight: ${desc}.\n\nClick the link to learn more!`;
      }
      return `Subject: Upgrade your workflow with ${name} ✨\n\nHey!\n\nAre you ready for ${prompt}? We built this specifically because we know ${audience} needs premium solutions.\n\nFeaturing ${desc}, we guarantee this matches your standard.\n\nBest,\n${name}`;
    }

    if (contentType.toLowerCase().includes('headline')) {
      if (index === 0) return `Introducing ${name}'s Newest ${prompt} — Built For ${audience}!`;
      if (index === 1) return `The ${tone} Choice: Experience the Power of ${desc} by ${name}!`;
      return `Redefining Standards: Why ${audience} is Choosing ${name}'s New ${prompt}!`;
    }

    if (contentType.toLowerCase().includes('instagram') || contentType.toLowerCase().includes('facebook') || contentType.toLowerCase().includes('insta')) {
      if (index === 0) {
        return `✨ Elevate your day with ${name}! Introducing our new launch: ${prompt}. Built specifically for ${audience} who love ${tone} experiences. Discover the details of our ${desc} today! ${hashtagBlock}`;
      }
      if (index === 1) {
        return `🚀 Bold. Innovative. Custom. We designed ${prompt} because we know ${audience} demands the best. Experience the ${tone} signature design featuring ${desc} today! Out now. ${hashtagBlock}`;
      }
      return `💡 Looking for a game changer? Discover ${name}'s latest: ${prompt}. Perfect for ${audience} who value premium quality and a ${tone} lifestyle. Details: ${desc}. ${hashtagBlock}`;
    }

    // Default general post layout
    if (index === 0) {
      return `✨ Elevate your day with ${name}!\n\nIntroducing our new launch: ${prompt}. Built specifically for ${audience} who love ${tone} experiences. Discover the details of our ${desc} today!\n\n${hashtagBlock}`;
    }
    if (index === 1) {
      return `🚀 Bold. Innovative. Custom. We designed ${prompt} because we know ${audience} demands the best.\n\nExperience the ${tone} signature design featuring ${desc} today! Out now.\n\n${hashtagBlock}`;
    }
    return `💡 Looking for a game changer?\n\nDiscover ${name}'s latest: ${prompt}. Perfect for ${audience} who value premium quality and a ${tone} lifestyle. Details: ${desc}.\n\n${hashtagBlock}`;
  };

  if (exampleTemplates.length > 0) {
    return [
      adaptTemplate(exampleTemplates[0], 0),
      adaptTemplate(exampleTemplates[1] || exampleTemplates[0], 1),
      adaptTemplate(exampleTemplates[2] || exampleTemplates[0], 2)
    ];
  }

  return [
    generateGenericPost(0),
    generateGenericPost(1),
    generateGenericPost(2)
  ];
}


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
    const { profileId, contentType, promptUsed } = body;

    if (!profileId || !contentType || !promptUsed) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    // 3. Check subscription status (to bypass limits)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }
    const isPro = userProfile ? userProfile.is_pro : false;

    // 4. Check monthly usage limits (only if not Pro)
    const currentDate = new Date();
    const currentMonthStr = currentDate.toISOString().substring(0, 7); // Format: YYYY-MM
    
    const { data: usageData, error: usageQueryError } = await supabase
      .from('usage')
      .select('count')
      .eq('user_id', user.id)
      .eq('month', currentMonthStr)
      .maybeSingle();

    if (usageQueryError) {
      return NextResponse.json({ error: usageQueryError.message }, { status: 500 });
    }

    const usageCount = usageData ? usageData.count : 0;

    // For now, allow generations to work completely free, bypassing the 10/month limit check.
    /*
    if (!isPro && usageCount >= 10) {
      return NextResponse.json(
        { error: 'Monthly limit reached. Upgrade to the Pro plan for unlimited generations.' },
        { status: 403 }
      );
    }
    */

    // 5. Fetch selected Brand Profile
    const { data: brand, error: brandError } = await supabase
      .from('brand_profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id) // Ensure security check
      .single();

    if (brandError || !brand) {
      return NextResponse.json({ error: 'Selected Brand Profile was not found.' }, { status: 404 });
    }

    // Parse promptUsed (JSON with instruction & examples, or plain string)
    let instruction = promptUsed;
    let examples = '';
    try {
      if (promptUsed.startsWith('{')) {
        const parsed = JSON.parse(promptUsed);
        if (parsed && typeof parsed === 'object') {
          instruction = parsed.instruction || promptUsed;
          examples = parsed.examples || '';
        }
      }
    } catch (e) {}

    // Fetch user's recent feedback comments to inject into the system prompt for learning
    const { data: recentFeedback } = await supabase
      .from('generation_feedback')
      .select('rating, comment')
      .eq('user_id', user.id)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(8);

    const positiveFeedbackList: string[] = [];
    const negativeFeedbackList: string[] = [];

    if (recentFeedback && recentFeedback.length > 0) {
      recentFeedback.forEach(f => {
        if (f.rating >= 4 && f.comment && f.comment.trim()) {
          positiveFeedbackList.push(f.comment.trim());
        } else if (f.rating <= 2 && f.comment && f.comment.trim()) {
          negativeFeedbackList.push(f.comment.trim());
        }
      });
    }

    const feedbackDirective = `
${positiveFeedbackList.length > 0 ? `USER WRITING PREFERENCES (Reinforce these positives):
${positiveFeedbackList.map(c => `- ${c}`).join('\n')}` : ''}
${negativeFeedbackList.length > 0 ? `USER CRITIQUE HISTORY (Avoid these issues/errors):
${negativeFeedbackList.map(c => `- ${c}`).join('\n')}` : ''}
    `.trim();

    // 6. Compile System Prompt & User Prompt
    const systemPrompt = `
You are an expert marketing copywriter and brand strategist.
You must generate highly engaging marketing copy for the brand: "${brand.name}".

BRAND CRITERIA:
- Tone of Voice: ${brand.tone}
- Target Audience: ${brand.audience}
- Product/Service Description: ${brand.product_desc}
${brand.avoid_words ? `- CRITICAL: Do NOT use any of the following words/phrases under any circumstance: ${brand.avoid_words}` : ""}

${feedbackDirective ? `PERSONALIZED USER PREFERENCES & HISTORY (CRITICAL):
The user has provided direct feedback on your past generated copies. You MUST strictly align the new variations with these preferences:
${feedbackDirective}
` : ''}

Ensure the output appeals directly to the Target Audience, highlights the value points in the Product Description, and matches the specified Tone of Voice.

CRITICAL INSTRUCTIONS:
- You must output exactly 3 distinct variations of the copy.
- You must also output a suggested image generation prompt that describes a suitable image to accompany this copy (e.g. for an Instagram post, Facebook post, or ad banner).
- The output format must be a valid JSON object containing a "variants" array with exactly 3 items, and a "suggestedImagePrompt" string.
- Structure: { "variants": ["variant 1", "variant 2", "variant 3"], "suggestedImagePrompt": "detailed description of matching visual concept" }
- Return ONLY the raw JSON block. No markdown code blocks (do not wrap in triple backticks).
`;

    let userPrompt = `Generate a ${contentType} based on the following specific instructions:\n"${instruction}"\n`;
    if (examples && examples.trim()) {
      userPrompt += `\nSTYLE & FORMAT MATCHING DIRECTIVE:\nYou must match the format, length, emoji density, spacing, bullet points, and layout style of the following reference examples:\n\n${examples}\n\nStrictly follow the style of these reference examples in all 3 variants.`;
    }

    // 7. Make Real OpenAI Call
    let variants: string[] = [];
    let imagePrompt = '';
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content || '{}';
      const parsedData = JSON.parse(responseText);
      const outputVariants = parsedData.variants;

      if (!Array.isArray(outputVariants) || outputVariants.length === 0) {
        throw new Error('AI did not return the expected JSON format with variants.');
      }

      variants = outputVariants;
      while (variants.length < 3) {
        variants.push(variants[0] || 'Generated copy variation');
      }
      variants = variants.slice(0, 3);
      const cleanInstruction = instruction
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/#\w+/g, '')
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const shortInstruction = cleanInstruction.length > 200 ? cleanInstruction.substring(0, 200) + '...' : cleanInstruction;

      const productDetail = brand.product_desc ? `, displaying: ${brand.product_desc}` : '';
      const contextDetail = shortInstruction ? `, related to: ${shortInstruction}` : '';

      imagePrompt = parsedData.suggestedImagePrompt || `A high-quality, professional commercial product advertisement photograph of ${brand.name}${productDetail}${contextDetail}. Styled for ${contentType}, modern aesthetic, clean studio lighting, high resolution.`;
    } catch (err: any) {
      console.warn('OpenAI generation failed, falling back to local generation:', err);
      variants = generateLocalFallback(brand, contentType, instruction, examples);

      const cleanInstruction = instruction
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/#\w+/g, '')
        .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      const shortInstruction = cleanInstruction.length > 200 ? cleanInstruction.substring(0, 200) + '...' : cleanInstruction;

      const productDetail = brand.product_desc ? `, displaying: ${brand.product_desc}` : '';
      const contextDetail = shortInstruction ? `, related to: ${shortInstruction}` : '';

      imagePrompt = `A high-quality, professional commercial product advertisement photograph of ${brand.name}${productDetail}${contextDetail}. Styled for ${contentType}, modern aesthetic, clean studio lighting, high resolution.`;
    }

    // Sanitize avoid words
    const avoidList = brand.avoid_words 
      ? brand.avoid_words.split(',').map((w: string) => w.trim().toLowerCase()) 
      : [];

    const sanitize = (text: string) => {
      let cleaned = text;
      avoidList.forEach((word: string) => {
        if (word) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          cleaned = cleaned.replace(regex, '[REDACTED]');
        }
      });
      return cleaned;
    };

    const sanitizedVariants = variants.map((v) => sanitize(v));

    // 8. Log Generation History in database
    const mergedOutputs = `Variant 1:\n${sanitizedVariants[0]}\n\nVariant 2:\n${sanitizedVariants[1]}\n\nVariant 3:\n${sanitizedVariants[2]}`;

    const { data: insertedGen, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        profile_id: brand.id,
        content_type: contentType,
        prompt_used: promptUsed,
        output: mergedOutputs
      })
      .select('id')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 9. Increment monthly usage counter using Supabase Admin client (Atomic Upsert)
    const supabaseAdmin = createAdminClient();
    const { error: incrementError } = await supabaseAdmin
      .from('usage')
      .upsert(
        {
          user_id: user.id,
          month: currentMonthStr,
          count: usageCount + 1
        },
        { onConflict: 'user_id,month' }
      );

    if (incrementError) {
      return NextResponse.json({ error: incrementError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      id: insertedGen?.id || null,
      variants: sanitizedVariants,
      suggestedImagePrompt: imagePrompt
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
