'use client';

import React, { useState, useEffect } from 'react';
import { login, signup } from './actions';
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient as createBrowserClient } from '@/utils/supabase/client';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qError = params.get('error');
      if (qError) {
        setError(decodeURIComponent(qError));
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`
        }
      });
      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Google Login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      if (isSignUp) {
        const result = await signup(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.success) {
          setSuccess(result.success);
        }
      } else {
        const result = await login(formData);
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Subtle background glow highlights */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-primary/5 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/25">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
            BrandVoice
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-bold tracking-tight text-text-primary">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          {isSignUp ? 'Already have an account? ' : "New to BrandVoice? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            type="button"
            className="font-semibold text-brand-primary hover:text-brand-hover transition-colors focus:outline-none focus:underline"
          >
            {isSignUp ? 'Sign in instead' : 'Create an account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-surface/50 backdrop-blur-md py-8 px-4 border border-border/80 shadow-2xl sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/25 text-danger text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-success/10 border border-success/25 text-success text-sm">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-sans text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full h-11 pl-4 pr-11 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all font-sans text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-brand-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* OAuth Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-text-secondary font-semibold tracking-wide">Or continue with</span>
            </div>
          </div>

          {/* OAuth Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-3 rounded-lg border border-border bg-background/50 hover:bg-surface/50 text-text-primary font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
