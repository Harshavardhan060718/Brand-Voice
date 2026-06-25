import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Target, 
  Sliders, 
  Palette, 
  Sparkles, 
  Cloud, 
  RefreshCw 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import ThemeToggle from '@/components/ThemeToggle';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Decorative gradient glow panels */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-brand-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-brand-primary/5 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-text-primary">
              BrandVoice
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <Link
                href="/dashboard"
                className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-lg border border-border bg-surface/50 text-text-secondary hover:text-text-primary font-semibold text-xs flex items-center justify-center transition-all cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-24 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 text-left">
        <div className="flex-1 space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/10 text-brand-primary text-xs font-semibold">
            <Sparkles className="h-3 w-3" /> Brand Copy & Visual Creator
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-text-primary leading-[1.1]">
            AI Copywriting & Visuals That Sound Like <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-indigo-500">Your Brand</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Stop producing generic, robotic AI campaigns. BrandVoice compiles copywriting and photorealistic visual recommendations directly tailored to your tone, audience, and constraints in one click.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="h-12 px-6 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-primary/20 w-full sm:w-auto"
            >
              Start Generating Free <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-text-muted">No credit card required. 10 free generations/mo.</span>
          </div>
        </div>

        {/* Dual UI Preview Showcase */}
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          {/* Panel 1: Brand Copy settings */}
          <div className="bg-surface/60 border border-border/80 shadow-2xl rounded-2xl p-5 backdrop-blur-md relative z-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                  1. Brand Profile
                </span>
                <div className="h-2 w-2 rounded-full bg-success" />
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-semibold text-text-muted uppercase">Brand Name</span>
                  <p className="text-xs font-bold text-text-primary">ThreeAtoms</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] font-semibold text-text-muted uppercase">Tone of Voice</span>
                    <p className="text-xs text-text-secondary font-medium">Professional, Bold</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold text-text-muted uppercase">Audience</span>
                    <p className="text-xs text-text-secondary font-medium">Startups, B2B</p>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-semibold text-text-muted uppercase font-mono">Avoid words</span>
                  <div className="flex gap-1.5 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-mono text-[9px]">cheap</span>
                    <span className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-mono text-[9px]">basic</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3 mt-4">
              <span className="text-[9px] font-bold text-brand-primary uppercase">Generated LinkedIn Post</span>
              <p className="mt-1.5 p-2 bg-background/50 border border-border/50 rounded-lg text-[10px] leading-normal text-text-primary italic">
                "Stop wasting hours on manual operations. We design and deploy high-performance custom AI agents in just 3 weeks to handle your workflows 24/7. 🚀"
              </p>
            </div>
          </div>

          {/* Panel 2: FLUX Visual Recommendation */}
          <div className="bg-surface/60 border border-border/80 shadow-2xl rounded-2xl p-5 backdrop-blur-md relative z-10 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                    2. FLUX.1 Visual
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-bold text-[8px] uppercase tracking-wide">
                  AI Model
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-semibold text-text-muted uppercase">Suggested visual prompt</span>
                <p className="text-[9px] leading-normal text-text-secondary bg-background/30 p-2 border border-border/50 rounded-lg italic line-clamp-3">
                  "A photorealistic commercial product photograph of a chrome molecule sculpture resting on a concrete plinth in a blurred B2B tech office background..."
                </p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/60 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
                  alt="FLUX Mock Creative Concept"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="block text-[8px] text-center text-text-muted">Visual rendered automatically</span>
            </div>
          </div>

          {/* Decorative glow panel behind preview */}
          <div className="absolute inset-0 -m-2 rounded-3xl bg-brand-primary/5 border border-brand-primary/10 pointer-events-none" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-surface/20 border-y border-border/60 py-16 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3 mb-12">
            <h2 className="font-display font-bold text-3xl text-text-primary">
              The Complete Creative Suite
            </h2>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
              Define your brand settings once and produce copy variations alongside photorealistic matching visuals instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-surface/40 border border-border/80 rounded-xl space-y-3">
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Sliders className="h-4 w-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary">Tone & Audience Control</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Shape generated outputs to address specific target personas (e.g. B2B, trainers) in your custom style.
              </p>
            </div>

            <div className="p-5 bg-surface/40 border border-border/80 rounded-xl space-y-3">
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Palette className="h-4 w-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary">Visual Recommendation</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                Generate high-quality product images and creative graphic mockups using the integrated FLUX.1 model.
              </p>
            </div>

            <div className="p-5 bg-surface/40 border border-border/80 rounded-xl space-y-3">
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Cloud className="h-4 w-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary">User-Specific Storage</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                All generated creatives are uploaded automatically to your private storage bucket and linked in database.
              </p>
            </div>

            <div className="p-5 bg-surface/40 border border-border/80 rounded-xl space-y-3">
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <RefreshCw className="h-4 w-4" />
              </div>
              <h3 className="font-display font-semibold text-base text-text-primary">Personalized Feedback</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                The copywriting compiler automatically learns from your reviews and ratings to refine future campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="font-display font-bold text-3xl text-text-primary">
            Simple, Transparent Pricing
          </h2>
          <p className="text-text-secondary text-sm">
            Choose the plan that matches your production scale. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 bg-surface/30 border border-border/80 rounded-2xl flex flex-col text-left space-y-6">
            <div>
              <h3 className="text-xl font-display font-bold text-text-primary">Free Plan</h3>
              <p className="text-text-secondary text-sm mt-1">Perfect for trying out BrandVoice.</p>
            </div>
            <div className="text-3xl font-display font-extrabold text-text-primary">
              $0 <span className="text-sm font-normal text-text-muted">/ month</span>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary flex-1">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> 10 generations per month</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Max 5 Brand Profiles</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Private User Storage Bucket</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> FLUX.1 Visual Generation</li>
            </ul>
            <Link
              href="/login"
              className="h-11 rounded-lg border border-border bg-surface/60 hover:text-text-primary text-text-secondary font-semibold text-xs flex items-center justify-center transition-all cursor-pointer"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro Tier */}
          <div className="p-8 bg-surface/50 border-2 border-brand-primary shadow-2xl shadow-brand-primary/5 rounded-2xl flex flex-col text-left space-y-6 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-primary text-white font-semibold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-text-primary">Pro Plan</h3>
              <p className="text-text-secondary text-sm mt-1">For growing startups and creators.</p>
            </div>
            <div className="text-3xl font-display font-extrabold text-text-primary">
              $19 <span className="text-sm font-normal text-text-muted">/ month</span>
            </div>
            <ul className="space-y-3 text-sm text-text-secondary flex-1">
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Unlimited AI Generations</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Unlimited Brand Profiles</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Priority Generation Speed</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Private User Storage Bucket</li>
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> A/B Variant Copy Testing</li>
            </ul>
            <Link
              href="/login"
              className="h-11 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-xs flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/25"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>&copy; {new Date().getFullYear()} BrandVoice. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
