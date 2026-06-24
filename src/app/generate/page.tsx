'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Loader2, 
  Send, 
  Clipboard, 
  Check, 
  Sliders,
  Type,
  AlertTriangle,
  FolderHeart,
  Image,
  Download,
  Palette,
  RefreshCw,
  Star,
  MessageSquare
} from 'lucide-react';

interface BrandProfile {
  id: string;
  name: string;
  tone: string;
  audience: string;
  product_desc: string;
}

const CONTENT_TYPES = [
  'Instagram Caption',
  'Facebook Post',
  'LinkedIn Post',
  'Ad Headline',
  'Product Description',
  'Cold Email',
  'Marketing Copy',
  'Custom Content Type...'
];

const LOADING_MESSAGES = [
  'Analyzing selected brand voice parameters...',
  'Aligning with target audience demographics...',
  'Excluding forbidden words from vocabulary list...',
  'Orchestrating variant configurations (GPT-4o)...',
  'Applying final formatting and checks...'
];

function GeneratorForm() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [contentType, setContentType] = useState(CONTENT_TYPES[0]);
  const [customContentType, setCustomContentType] = useState('');
  const [promptUsed, setPromptUsed] = useState('');
  const [examples, setExamples] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [variants, setVariants] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // AI Image Generation states
  const [suggestedPrompt, setSuggestedPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // AI Feedback states
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!suggestedPrompt) return;
    setGeneratingImage(true);
    setImageError(null);
    setImageUrl('');
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: suggestedPrompt })
      });
      const data = await res.json();
      if (res.ok) {
        setImageUrl(data.url);
      } else {
        setImageError(data.error || 'Failed to generate image.');
      }
    } catch (err) {
      setImageError('Connection error occurred while generating image.');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brandvoice-visual-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Image download failed', err);
      // Fallback
      window.open(imageUrl, '_blank');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generationId || rating === 0) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationId,
          rating,
          comment: feedbackComment
        })
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackSubmitted(true);
      } else {
        setFeedbackError(data.error || 'Failed to submit feedback.');
      }
    } catch (err) {
      setFeedbackError('A connection error occurred. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        window.location.href = data.url;
      } else {
        alert('Billing upgrade session initialization failed.');
      }
    } catch (err) {
      console.error('Checkout redirect failed', err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fetch brand profiles on mount
  useEffect(() => {
    async function loadProfiles() {
      try {
        setLoadingProfiles(true);
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
          
          // Pre-populate forms if query parameters are present
          const qProfileId = searchParams.get('profileId');
          const qContentType = searchParams.get('contentType');
          const qPromptUsed = searchParams.get('promptUsed');
          const qExamples = searchParams.get('examples');

          if (qProfileId) {
            setSelectedProfileId(qProfileId);
          } else if (data.profiles && data.profiles.length > 0) {
            setSelectedProfileId(data.profiles[0].id);
          }

          if (qContentType) {
            const cleanContentType = decodeURIComponent(qContentType);
            if (CONTENT_TYPES.filter(t => t !== 'Custom Content Type...').includes(cleanContentType)) {
              setContentType(cleanContentType);
            } else {
              setContentType('Custom Content Type...');
              setCustomContentType(cleanContentType);
            }
          }
          if (qPromptUsed) {
            const decodedPrompt = decodeURIComponent(qPromptUsed);
            try {
              if (decodedPrompt.startsWith('{')) {
                const parsed = JSON.parse(decodedPrompt);
                if (parsed && typeof parsed === 'object') {
                  setPromptUsed(parsed.instruction || '');
                  setExamples(parsed.examples || '');
                } else {
                  setPromptUsed(decodedPrompt);
                }
              } else {
                setPromptUsed(decodedPrompt);
              }
            } catch (e) {
              setPromptUsed(decodedPrompt);
            }
          }
          if (qExamples) {
            setExamples(decodeURIComponent(qExamples));
          }
        }
      } catch (err) {
        console.error('Failed to fetch brand profiles', err);
      } finally {
        setLoadingProfiles(false);
      }
    }
    loadProfiles();
  }, [searchParams]);

  // Cycle through loading messages while generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      setLoadingMessageIndex(0);
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfileId) {
      setError('Please select or create a Brand Profile first.');
      return;
    }
    if (!promptUsed.trim()) {
      setError('Please enter custom content instructions.');
      return;
    }

    const finalContentType = contentType === 'Custom Content Type...' ? customContentType : contentType;
    if (contentType === 'Custom Content Type...' && !customContentType.trim()) {
      setError('Please enter a custom content type.');
      return;
    }

    setError(null);
    setGenerating(true);
    setVariants([]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: selectedProfileId,
          contentType: finalContentType,
          promptUsed: JSON.stringify({ instruction: promptUsed, examples })
        })
      });

      const data = await res.json();

      if (res.ok) {
        setVariants(data.variants || []);
        setSuggestedPrompt(data.suggestedImagePrompt || '');
        setImageUrl('');
        setImageError(null);
        
        // Save new generation details and reset feedback state
        setGenerationId(data.id || null);
        setRating(0);
        setFeedbackComment('');
        setFeedbackSubmitted(false);
        setFeedbackError(null);
        
        // Trigger success confetti pop!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError(data.error || 'Content generation failed.');
      }
    } catch (err) {
      setError('A connection error occurred. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left">
        {/* Workspace Title */}
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
            AI Content Generator
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Build specialized, high-performing copy variants aligned with your guidelines.
          </p>
        </div>

        {/* Outer Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Form Control (5 Columns) */}
          <form 
            onSubmit={handleGenerate} 
            className="lg:col-span-5 bg-surface/50 border border-border/80 rounded-xl p-6 space-y-6 backdrop-blur-md"
          >
            <div className="border-b border-border/60 pb-3 flex items-center gap-1.5 text-text-primary">
              <Sparkles className="h-4 w-4 text-brand-primary animate-pulse" />
              <span className="font-display font-bold text-sm">Generator Settings</span>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs leading-relaxed space-y-3">
                <p>{error}</p>
                {error.toLowerCase().includes('limit') && (
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={checkoutLoading}
                    className="w-full h-9 flex items-center justify-center gap-1.5 rounded bg-danger text-white text-xs font-semibold hover:bg-danger/90 cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro Now'}
                  </button>
                )}
              </div>
            )}

            {/* Brand Profile Selector */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2 flex items-center gap-1">
                <Sliders className="h-3 w-3 text-text-muted" /> Select Brand Profile
              </label>
              {loadingProfiles ? (
                <div className="w-full h-11 bg-background/50 border border-border rounded-lg flex items-center px-4">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-primary mr-2" />
                  <span className="text-xs text-text-muted">Loading profiles...</span>
                </div>
              ) : profiles.length === 0 ? (
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg text-warning text-xs space-y-2">
                  <p className="font-semibold">No Brand Profiles Found</p>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    You need to set up at least one Brand Profile profile before you can write custom copy.
                  </p>
                  <Link href="/profiles" className="inline-block font-semibold text-warning hover:underline">
                    Create Brand Profile Now &rarr;
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  disabled={generating}
                  className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.tone})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Content Template Selector */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2 flex items-center gap-1">
                <Type className="h-3 w-3 text-text-muted" /> Select Content Template
              </label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                disabled={generating}
                className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm cursor-pointer disabled:opacity-50"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {contentType === 'Custom Content Type...' && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase">
                  Enter Custom Content Type
                </label>
                <input
                  type="text"
                  required
                  value={customContentType}
                  onChange={(e) => setCustomContentType(e.target.value)}
                  disabled={generating}
                  className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm disabled:opacity-50"
                  placeholder="e.g. LinkedIn Post, Twitter Thread, TikTok Caption"
                />
              </div>
            )}

            {/* Custom user instructions */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                What are you promoting? (Custom Instructions)
              </label>
              <textarea
                rows={4}
                required
                value={promptUsed}
                onChange={(e) => setPromptUsed(e.target.value)}
                disabled={generating || profiles.length === 0}
                className="block w-full p-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm resize-none disabled:opacity-50"
                placeholder="e.g. Introduce our new ergonomic office chair launching this Friday with a 15% discount for early adopters..."
              />
            </div>

            {/* Style Reference Examples */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                Style Reference Examples (Optional)
              </label>
              <textarea
                rows={4}
                value={examples}
                onChange={(e) => setExamples(e.target.value)}
                disabled={generating || profiles.length === 0}
                className="block w-full p-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm resize-none disabled:opacity-50"
                placeholder="Paste previous posts or copy here. The AI will analyze and mimic this exact structure, formatting (e.g. lists, hashtags), emoji density, and tone."
              />
            </div>

            {/* Submit Generate trigger */}
            <button
              type="submit"
              disabled={generating || profiles.length === 0}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm shadow-lg shadow-brand-primary/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Generate Copy
                </>
              )}
            </button>
          </form>

          {/* Right Column - Workspaces Canvas (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Default Workspace Empty State */}
            {!generating && variants.length === 0 && (
              <div className="bg-surface/50 border border-border/80 rounded-xl p-12 text-center space-y-4 backdrop-blur-md py-24">
                <div className="h-14 w-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="h-6 w-6 text-brand-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-text-primary">Workspace Canvas</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                  Configure your brand settings, template format, and click "Generate Copy" to see your tailor-made copy variants render here.
                </p>
              </div>
            )}

            {/* 2. Loading Shimmer Skeletons */}
            {generating && (
              <div className="bg-surface/50 border border-border/80 rounded-xl p-6 space-y-6 backdrop-blur-md animate-shimmer py-8">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto" />
                  <p className="text-xs font-semibold text-brand-primary font-display tracking-wider animate-pulse transition-all">
                    {LOADING_MESSAGES[loadingMessageIndex]}
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border border-border/40 rounded-lg bg-background/20 space-y-2.5">
                      <div className="h-3 w-16 bg-border/40 rounded" />
                      <div className="h-2 w-full bg-border/20 rounded" />
                      <div className="h-2 w-3/4 bg-border/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Generated Variants Display */}
            {!generating && variants.length > 0 && (
              <div className="space-y-4">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:border-brand-primary/40 transition-colors flex flex-col justify-between gap-3 text-left relative group animate-fade-in"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex justify-between items-center border-b border-border/60 pb-2">
                      <span className="text-[10px] font-semibold text-brand-primary tracking-wider uppercase font-mono">
                        Copy Variant 0{i + 1}
                      </span>
                      <button
                        onClick={() => handleCopyToClipboard(v, i)}
                        className="text-text-muted hover:text-text-primary hover:bg-surface/50 p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        {copiedIndex === i ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="text-xs md:text-sm leading-relaxed text-text-primary whitespace-pre-wrap select-text">
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3.5. Feedback / Personalization Card */}
            {!generating && variants.length > 0 && generationId && (
              <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md space-y-4 text-left animate-fadeIn mt-6 animate-fade-in">
                <div className="border-b border-border/60 pb-3 flex items-center gap-1.5 text-text-primary justify-between">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-brand-primary" />
                    <span className="font-display font-bold text-sm">Train Your Copywriter AI</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[9px] font-semibold font-mono uppercase tracking-wide">
                    Personalization Loop
                  </span>
                </div>

                {feedbackSubmitted ? (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-success text-xs text-center space-y-2 py-6">
                    <Sparkles className="h-6 w-6 text-success mx-auto animate-bounce" />
                    <p className="font-bold">Preferences Saved!</p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      The AI has updated its writing profile based on your rating and critique. Future generations will automatically respect these preferences.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        Rate the Quality of This Copy
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= rating
                                  ? 'text-warning fill-warning'
                                  : 'text-text-muted hover:text-warning'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {rating > 0 && (
                      <div className="space-y-2 animate-fade-in">
                        <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                          {rating >= 4 
                            ? "What did you like? (Reinforce positive style)" 
                            : "What should the AI do differently next time?"}
                        </label>
                        <textarea
                          rows={2}
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder={
                            rating >= 4
                              ? "e.g., 'Loved the cinematic hook', 'The bullet points were very neat'"
                              : "e.g., 'Make it punchier', 'Do not use emojis', 'Avoid long paragraphs'"
                          }
                          className="block w-full p-3 rounded-lg border border-border bg-background/30 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none"
                        />
                        
                        <button
                          type="submit"
                          disabled={submittingFeedback}
                          className="w-full h-10 flex items-center justify-center gap-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                        >
                          {submittingFeedback ? 'Saving preferences...' : 'Train AI with Feedback'}
                        </button>
                      </div>
                    )}

                    {feedbackError && (
                      <p className="text-xs text-danger font-semibold mt-1">
                        {feedbackError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            )}

             {/* 4. Suggested Visual / FLUX Image Card */}
            {!generating && variants.length > 0 && suggestedPrompt && (
              <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md space-y-6 text-left animate-fadeIn mt-6">
                <div className="border-b border-border/60 pb-3 flex items-center gap-1.5 text-text-primary justify-between">
                  <div className="flex items-center gap-1.5">
                    <Palette className="h-4 w-4 text-brand-primary" />
                    <span className="font-display font-bold text-sm">Suggested Visual Concept</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold text-[9px] tracking-wide uppercase font-mono">
                    FLUX.1
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                      Visual Prompt (Editable)
                    </label>
                    <textarea
                      rows={3}
                      value={suggestedPrompt}
                      onChange={(e) => setSuggestedPrompt(e.target.value)}
                      disabled={generatingImage}
                      className="block w-full p-4 rounded-xl border border-border bg-background/30 text-xs text-text-primary focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none font-medium italic"
                      placeholder="Describe the visual concept you want FLUX to generate..."
                    />
                  </div>
                  
                  {/* Generate Button */}
                  {!imageUrl && !generatingImage && (
                    <button
                      type="button"
                      onClick={handleGenerateImage}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-md shadow-brand-primary/10 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <Image className="h-4 w-4" />
                      Generate Visual Recommendation
                    </button>
                  )}

                  {/* Loading State */}
                  {generatingImage && (
                    <div className="border border-border/85 rounded-xl p-8 bg-background/20 text-center space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-brand-primary mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-text-primary">FLUX is painting your concept...</p>
                        <p className="text-[10px] text-text-muted mt-1 leading-normal">
                          This usually takes around 2-5 seconds. Please do not close this window.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {imageError && (
                    <div className="p-4 rounded-lg bg-danger/10 border border-danger/25 text-danger text-xs leading-relaxed">
                      {imageError}
                      <button
                        type="button"
                        onClick={handleGenerateImage}
                        className="w-full h-9 flex items-center justify-center gap-1.5 rounded bg-danger text-white text-xs font-semibold hover:bg-danger/90 cursor-pointer mt-3 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Success Image Card */}
                  {imageUrl && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-xl border border-border/80 shadow-lg group/img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imageUrl} 
                          alt="FLUX generated visual"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          type="button"
                          onClick={handleDownloadImage}
                          className="h-10 px-5 flex items-center justify-center gap-2 rounded-lg bg-success hover:bg-success/90 text-white text-xs font-semibold shadow-md shadow-success/10 transition-all cursor-pointer"
                        >
                          <Download className="h-4 w-4" />
                          Download Image
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(imageUrl);
                            alert('Image URL copied to clipboard! (Note: Link expires in 1 hour)');
                          }}
                          className="h-10 px-5 flex items-center justify-center gap-2 rounded-lg border border-border bg-surface hover:bg-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                        >
                          <Clipboard className="h-4 w-4" />
                          Copy Temporary Link
                        </button>
                        <button
                          type="button"
                          onClick={handleGenerateImage}
                          className="h-10 px-5 flex items-center justify-center gap-2 rounded-lg border border-brand-primary/20 hover:border-brand-primary/45 bg-brand-primary/5 hover:bg-brand-primary/10 text-xs font-semibold text-brand-primary transition-all cursor-pointer"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate Concept
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <span className="text-xs">Loading generation panel...</span>
        </div>
      </DashboardLayout>
    }>
      <GeneratorForm />
    </Suspense>
  );
}
