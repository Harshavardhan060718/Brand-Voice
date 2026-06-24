import Link from 'next/link';
import { ShieldCheck, ArrowRight, Zap, Target, Sliders, MessageSquare, Clipboard } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import ThemeToggle from '@/components/ThemeToggle';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/5 blur-[130px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border/60">
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
                className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-lg border border-border bg-surface/50 text-text-secondary hover:text-text-primary font-semibold text-sm flex items-center justify-center transition-all cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="h-9 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/20"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary/20 bg-brand-primary/10 text-brand-primary text-xs font-semibold">
            <Zap className="h-3 w-3" /> Empowering On-Brand Content at Scale
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-text-primary leading-[1.1]">
            AI Copywriting that Actually Sounds Like <span className="text-brand-primary">Your Brand</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
            Stop producing generic, robotic AI content. BrandVoice learns your brand tone, target audience, and content constraints to write high-converting copy that matches your exact identity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="h-12 px-6 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-primary/20 w-full sm:w-auto"
            >
              Start Generating Free <ArrowRight className="h-5 w-5" />
            </Link>
            <span className="text-xs text-text-muted">No credit card required. 10 free generations/mo.</span>
          </div>
        </div>

        {/* Dynamic UI Preview Showcase */}
        <div className="flex-1 w-full max-w-md lg:max-w-none relative">
          <div className="bg-surface/50 border border-border/80 shadow-2xl rounded-2xl p-6 backdrop-blur-md relative z-10">
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-primary">
                Brand Settings Profile
              </span>
              <div className="h-2 w-2 rounded-full bg-success" />
            </div>

            <div className="space-y-4 text-left">
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase">Brand Name</span>
                <p className="text-sm font-semibold text-text-primary">Nike</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase">Tone of Voice</span>
                  <p className="text-sm text-text-secondary">Bold, Motivational</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase">Audience</span>
                  <p className="text-sm text-text-secondary">Athletes, Dreamers</p>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-text-muted uppercase font-mono">Avoid These Words</span>
                <div className="flex gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-mono text-[10px]">cheap</span>
                  <span className="px-2 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-mono text-[10px]">budget</span>
                </div>
              </div>

              <div className="border-t border-border/60 pt-4 mt-4">
                <span className="text-[10px] font-semibold text-brand-primary uppercase">Generated Copy Preview</span>
                <div className="mt-2 p-3 bg-background/50 border border-border rounded-lg text-xs leading-relaxed text-text-primary italic">
                  "Yesterday you said tomorrow. Do it now. Lace up the new Air-Zoom and find your motivation. #JustDoIt"
                </div>
              </div>
            </div>
          </div>
          {/* Decorative glow panel behind preview */}
          <div className="absolute top-4 left-4 w-full h-full rounded-2xl bg-brand-primary/5 border border-brand-primary/10 pointer-events-none" />
        </div>
      </section>

      {/* Feature Section */}
      <section className="bg-surface/20 border-y border-border/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <h2 className="font-display font-bold text-3xl text-text-primary">
              Built for Modern Marketing Needs
            </h2>
            <p className="text-text-secondary text-sm sm:text-base">
              Say goodbye to prompt engineering. Define your brand once and generate copy for all your networks instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-surface/40 border border-border/80 rounded-xl space-y-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary">Tone & Style Control</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Specify detailed brand parameters like bold, casual, technical, or motivational to instruct the compiler.
              </p>
            </div>

            <div className="p-6 bg-surface/40 border border-border/80 rounded-xl space-y-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary">Target Audience Alignment</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Shape generated outputs to address target personas (e.g. freelance web developers, gym trainers).
              </p>
            </div>

            <div className="p-6 bg-surface/40 border border-border/80 rounded-xl space-y-4 text-left">
              <div className="h-10 w-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-text-primary">Negative Constraints</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Prevent the AI from using words you hate or competitors' trademarks using the words to avoid guard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display font-bold text-3xl text-text-primary mb-12">
          Simple, Transparent Pricing
        </h2>

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
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> Standard AI Model</li>
            </ul>
            <Link
              href="/login"
              className="h-11 rounded-lg border border-border bg-surface/60 hover:text-text-primary text-text-secondary font-semibold text-sm flex items-center justify-center transition-all cursor-pointer"
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
              <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-brand-primary" /> A/B Variant Testing (3 variants)</li>
            </ul>
            <Link
              href="/login"
              className="h-11 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-brand-primary/25"
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
