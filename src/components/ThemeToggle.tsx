'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    setTheme(nextTheme);
  };

  // Prevent hydration mismatch by rendering a skeleton matching the size
  if (!mounted) {
    return <div className="w-9 h-9 rounded-lg border border-border bg-surface/50" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-lg border border-border bg-surface/50 text-text-secondary hover:text-text-primary hover:bg-surface transition-all flex items-center justify-center cursor-pointer shadow-sm relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      aria-label="Toggle Theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="relative z-10 block transition-transform duration-300 group-hover:scale-110">
        {theme === 'dark' ? (
          <Sun className="h-[18px] w-[18px] text-warning" />
        ) : (
          <Moon className="h-[18px] w-[18px] text-brand-primary" />
        )}
      </span>
    </button>
  );
}
