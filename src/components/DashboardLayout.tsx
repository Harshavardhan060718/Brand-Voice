'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Sliders, 
  Zap, 
  FolderHeart, 
  LogOut, 
  Menu, 
  X,
  User
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [usage, setUsage] = useState({ count: 0, isPro: false, isAdmin: false });
  const [userEmail, setUserEmail] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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

  // Fetch current monthly usage stats dynamically
  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch('/api/dashboard-metrics');
        if (res.ok) {
          const data = await res.json();
          setUsage({
            count: data.metrics.usageCount,
            isPro: data.metrics.isPro,
            isAdmin: data.metrics.isAdmin
          });
          setUserEmail(data.metrics.email);
        }
      } catch (err) {
        console.error('Failed to load usage in sidebar', err);
      }
    }
    fetchUsage();
  }, [pathname]); // Refresh count on page transitions

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Brand Profiles', href: '/profiles', icon: Sliders },
    { name: 'Generate Copy', href: '/generate', icon: Zap },
    { name: 'Content Library', href: '/library', icon: FolderHeart },
    ...(usage.isAdmin ? [{ name: 'Admin Panel', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const pageTitle = navigation.find((item) => item.href === pathname)?.name || 'BrandVoice';

  // Helper to determine usage ring color
  const limit = 10;
  const percentage = Math.min((usage.count / limit) * 100, 100);
  const strokeColor = percentage >= 80 ? 'stroke-danger' : percentage >= 50 ? 'stroke-warning' : 'stroke-brand-primary';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between px-4 h-16 bg-surface border-b border-border/80 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">BrandVoice</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-text-secondary hover:text-text-primary focus:outline-none p-1"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-surface border-r border-border/80 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-text-primary">
                BrandVoice
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-text-secondary hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    group flex items-center gap-3 h-11 px-4 rounded-lg font-semibold text-sm transition-all cursor-pointer
                    ${active 
                      ? 'bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary rounded-l-none' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 transition-colors ${active ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-primary'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Usage Ring & Profile) */}
        <div className="space-y-6 pt-6 border-t border-border/60">
          {!usage.isPro ? (
            <div className="p-4 rounded-xl bg-background/50 border border-border/60 flex items-center gap-4">
              {/* Circular SVG Progress Ring */}
              <div className="relative h-12 w-12 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-border"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${strokeColor} transition-all duration-500`}
                    strokeWidth="3.5"
                    strokeDasharray={`${percentage}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">
                  {usage.count}/{limit}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">Free Generations</span>
                <button
                  onClick={handleUpgrade}
                  disabled={checkoutLoading}
                  className="text-xs font-semibold text-brand-primary hover:text-brand-hover transition-colors block text-left cursor-pointer focus:outline-none disabled:opacity-50"
                >
                  {checkoutLoading ? 'Redirecting...' : 'Upgrade to Pro'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-primary" />
              <div className="text-xs font-bold text-brand-primary uppercase tracking-wide">
                Pro Subscriber
              </div>
            </div>
          )}

          {/* User Logged In Profile */}
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-border flex items-center justify-center text-text-secondary">
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-text-primary truncate">{userEmail || 'My Account'}</p>
                <span className="text-[10px] text-text-muted capitalize">{usage.isPro ? 'Pro User' : 'Free Tier'}</span>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-all focus:outline-none"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Desktop Header */}
        <header className="hidden md:flex items-center justify-between h-[70px] border-b border-border/80 px-8 bg-surface/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
            <span>BrandVoice</span>
            <span className="text-text-muted font-normal">/</span>
            <span className="text-text-primary">{pageTitle}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <span className="text-xs text-text-muted bg-surface px-2.5 py-1 border border-border rounded-md font-mono">
              Status: Connected
            </span>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}
    </div>
  );
}
