'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import confetti from 'canvas-confetti';
import { 
  Sliders, 
  FolderHeart, 
  Zap, 
  Calendar, 
  ArrowRight,
  Clipboard,
  Check,
  Sparkles,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface GenerationLog {
  id: string;
  contentType: string;
  promptUsed: string;
  output: string;
  createdAt: string;
  brandName: string;
}

interface DashboardMetrics {
  profilesCount: number;
  totalGenerations: number;
  usageCount: number;
  isPro: boolean;
  email: string;
  daysUntilReset: number;
  recentGenerations: GenerationLog[];
}

const parsePrompt = (promptStr: string) => {
  try {
    if (promptStr.startsWith('{')) {
      const parsed = JSON.parse(promptStr);
      if (parsed && typeof parsed === 'object') {
        return {
          instruction: parsed.instruction || '',
          examples: parsed.examples || ''
        };
      }
    }
  } catch (e) {}
  return {
    instruction: promptStr,
    examples: ''
  };
};

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch('/api/dashboard-metrics');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }

    // Check if redirect query string contains upgrade=success
    const upgradeStatus = searchParams.get('upgrade');
    if (upgradeStatus === 'success') {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
    }

    loadMetrics();
  }, [searchParams]);

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/billing/checkout', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // Redirect to Stripe checkout portal or sandbox redirect URL
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

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8 animate-pulse text-left">
          {/* Metrics Loading Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-surface/50 border border-border/40 rounded-xl" />
            ))}
          </div>
          {/* Main Grid Loading */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-96 bg-surface/30 border border-border/40 rounded-xl" />
            <div className="h-96 bg-surface/30 border border-border/40 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const m = metrics || {
    profilesCount: 0,
    totalGenerations: 0,
    usageCount: 0,
    isPro: false,
    email: '',
    daysUntilReset: 0,
    recentGenerations: []
  };

  const limit = 10;
  const usagePercentage = Math.min((m.usageCount / limit) * 100, 100);
  const progressColor = usagePercentage >= 80 ? 'bg-danger shadow-lg shadow-danger/20' : usagePercentage >= 50 ? 'bg-warning shadow-lg shadow-warning/20' : 'bg-brand-primary shadow-lg shadow-brand-primary/20';

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left">
        {/* Top Header Greetings */}
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
            Welcome Back!
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Analyze your workspace configurations and content output generations.
          </p>
        </div>

        {/* 4-Column KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Brands Card */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Active Brands</span>
                <span className="text-2xl font-display font-bold text-text-primary mt-1 block">{m.profilesCount}</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Sliders className="h-5 w-5" />
              </div>
            </div>
            <Link href="/profiles" className="text-[10px] font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-0.5 mt-2 transition-colors">
              Manage Brand Profiles <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Generations Card */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Generated Outputs</span>
                <span className="text-2xl font-display font-bold text-text-primary mt-1 block">{m.totalGenerations}</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <FolderHeart className="h-5 w-5" />
              </div>
            </div>
            <Link href="/library" className="text-[10px] font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-0.5 mt-2 transition-colors">
              View Content Library <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Usage Progress Card */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Monthly Quota</span>
                <span className="text-2xl font-display font-bold text-text-primary mt-1 block">
                  {m.isPro ? 'Unlimited' : `${m.usageCount} / ${limit}`}
                </span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            
            {!m.isPro ? (
              <div className="mt-2 space-y-1.5">
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-text-muted uppercase">
                  <span>{Math.round(usagePercentage)}% Used</span>
                  <span>Free limit: {limit}</span>
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-success font-semibold mt-2">Bypassing limits (Pro Plan)</span>
            )}
          </div>

          {/* Limit Reset Scheduler */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:-translate-y-0.5 transition-all flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Days until reset</span>
                <span className="text-2xl font-display font-bold text-text-primary mt-1 block">{m.daysUntilReset} Days</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <span className="text-[10px] text-text-muted mt-2 block font-mono">Reset Date: 1st of next month</span>
          </div>
        </div>

        {/* Dashboard Workspaces (Split panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Area - Recent Generations TIMELINE */}
          <div className="lg:col-span-2 bg-surface/50 border border-border/80 rounded-xl p-6 flex flex-col gap-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-display font-bold text-base text-text-primary">
                Recent Generation Feed
              </span>
              <Link href="/library" className="text-xs font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-0.5 transition-colors">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {m.recentGenerations.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-border/40 rounded-xl text-text-secondary">
                <Sparkles className="h-10 w-10 text-brand-primary/30 mx-auto mb-3" />
                <p className="text-sm font-semibold">No recent outputs</p>
                <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
                  You haven't generated any marketing copy yet. Create brand guidelines and launch the generator to start.
                </p>
                <Link
                  href="/generate"
                  className="mt-4 inline-flex h-9 px-4 items-center justify-center gap-1.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-lg shadow-brand-primary/15 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Generate Content
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {m.recentGenerations.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 rounded-lg border border-border bg-background/30 hover:border-brand-primary/50 transition-colors flex flex-col justify-between gap-3 text-left relative group"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        {/* Badges Info */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold text-[10px] tracking-wide uppercase">
                            {item.contentType}
                          </span>
                          <span className="text-[10px] font-semibold text-text-secondary font-display">
                            Brand: <span className="text-text-primary">{item.brandName}</span>
                          </span>
                        </div>
                        {/* Prompt instructions */}
                        {(() => {
                          const parsed = parsePrompt(item.promptUsed);
                          return (
                            <p className="text-xs text-text-secondary italic mt-2">
                              "{parsed.instruction}"
                            </p>
                          );
                        })()}
                      </div>

                      {/* Copy action */}
                      <button
                        onClick={() => handleCopyToClipboard(item.output, item.id)}
                        className="text-text-muted hover:text-text-primary hover:bg-surface/50 p-1.5 rounded-lg transition-colors focus:outline-none flex-shrink-0 cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Clipboard className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Output Content */}
                    <div className="p-3 bg-background/50 border border-border rounded-lg text-xs leading-relaxed text-text-primary whitespace-pre-wrap">
                      {item.output}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Area - Quick Operations Panel */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-surface/50 border border-border/80 rounded-xl p-6 space-y-4 backdrop-blur-md">
              <span className="font-display font-bold text-base text-text-primary block border-b border-border/60 pb-3">
                Quick Commands
              </span>

              <div className="flex flex-col gap-3">
                <Link
                  href="/generate"
                  className="w-full h-11 flex items-center justify-between px-4 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-lg shadow-brand-primary/15 transition-all active:scale-[0.98]"
                >
                  <span>Launch Content Generator</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/profiles"
                  className="w-full h-11 flex items-center justify-between px-4 rounded-lg border border-border bg-surface/50 text-text-secondary hover:text-text-primary text-xs font-semibold transition-all active:scale-[0.98]"
                >
                  <span>Setup Brand Guidelines</span>
                  <ArrowRight className="h-4 w-4 text-text-muted" />
                </Link>
              </div>
            </div>

            {/* Free tier lock alert warning */}
            {!m.isPro && m.usageCount >= 8 && (
              <div className="p-5 rounded-xl border border-warning/20 bg-warning/5 text-warning space-y-2 flex flex-col justify-between">
                <div className="text-xs font-bold uppercase tracking-wide">Usage Limit Warning</div>
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  You are currently at **{m.usageCount}/10** monthly free generation queries. Once you reach 10, generation will lock until next month.
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  className="text-xs font-bold text-warning hover:underline mt-2 flex items-center gap-0.5 cursor-pointer disabled:opacity-50 text-left focus:outline-none"
                >
                  {checkoutLoading ? 'Initiating Checkout...' : 'Unlock Unlimited Generations'} <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-secondary">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          <span className="text-xs">Loading dashboard analytics...</span>
        </div>
      </DashboardLayout>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}
