'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Users, 
  Zap, 
  Sliders, 
  FileText, 
  Search, 
  Trash2, 
  Loader2, 
  ShieldAlert, 
  Shield, 
  UserX, 
  X,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface Metrics {
  totalUsers: number;
  proUsers: number;
  totalBrands: number;
  totalGenerations: number;
}

interface UserStat {
  id: string;
  email: string;
  is_pro: boolean;
  is_admin: boolean;
  created_at: string;
  profiles_count: number;
  generations_count: number;
}

interface GenerationLog {
  id: string;
  content_type: string;
  prompt_used: string;
  output: string;
  created_at: string;
  user_id: string;
  user_email: string;
  brand_name: string;
}

interface AdminDashboardClientProps {
  currentUserEmail: string;
  currentUserId: string;
}

export default function AdminDashboardClient({ 
  currentUserEmail, 
  currentUserId 
}: AdminDashboardClientProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [users, setUsers] = useState<UserStat[]>([]);
  const [generations, setGenerations] = useState<GenerationLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<'users' | 'generations'>('users');
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [generationsLoading, setGenerationsLoading] = useState(true);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [genSearch, setGenSearch] = useState('');

  // Action status states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Inspect Modal
  const [selectedGen, setSelectedGen] = useState<GenerationLog | null>(null);

  // Load metrics
  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      const res = await fetch('/api/admin/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin metrics', err);
    } finally {
      setMetricsLoading(false);
    }
  };

  // Load users list
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load admin users', err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Load generations list
  const fetchGenerations = async () => {
    try {
      setGenerationsLoading(true);
      const res = await fetch('/api/admin/generations');
      if (res.ok) {
        const data = await res.json();
        setGenerations(data.generations);
      }
    } catch (err) {
      console.error('Failed to load admin generations', err);
    } finally {
      setGenerationsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchUsers();
    fetchGenerations();
  }, []);

  // Toggle user tier (Pro / Free)
  const handleTogglePro = async (userId: string, currentProStatus: boolean) => {
    setActionLoadingId(userId + '-pro');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pro: !currentProStatus })
      });
      if (res.ok) {
        // Refresh local state
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_pro: !currentProStatus } : u));
        // Refresh metrics
        fetchMetrics();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update user billing tier');
      }
    } catch (err) {
      console.error('Pro toggle error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle user role (Admin / User)
  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    if (userId === currentUserId) {
      alert('You cannot demote yourself from Admin.');
      return;
    }
    setActionLoadingId(userId + '-admin');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: !currentAdminStatus })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentAdminStatus } : u));
        fetchMetrics();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to update user administrative status');
      }
    } catch (err) {
      console.error('Admin toggle error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    setActionLoadingId(userId + '-delete');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeleteConfirmId(null);
        fetchMetrics();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete user account');
      }
    } catch (err) {
      console.error('Delete user error', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filters
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredGenerations = generations.filter(g => 
    (g.user_email?.toLowerCase() || '').includes(genSearch.toLowerCase()) ||
    (g.brand_name?.toLowerCase() || '').includes(genSearch.toLowerCase()) ||
    (g.content_type?.toLowerCase() || '').includes(genSearch.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left animate-fadeIn">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-text-primary tracking-tight">
              Admin Platform Console
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Supervising metrics, user subscription models, roles, and content audit logs.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface px-4 py-2 border border-border/80 rounded-xl max-w-fit shadow-sm">
            <Shield className="h-4 w-4 text-brand-primary" />
            <span className="text-xs font-semibold text-text-secondary truncate">
              Signed in as: <span className="text-brand-primary font-bold">{currentUserEmail}</span>
            </span>
          </div>
        </div>

        {/* Platform metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Users */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md transition-all hover:shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Users
              </span>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              {metricsLoading ? (
                <div className="h-8 w-16 bg-shimmer animate-pulse rounded" />
              ) : (
                <span className="font-display font-extrabold text-3xl text-text-primary">
                  {metrics?.totalUsers}
                </span>
              )}
            </div>
            <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-brand-primary/5 rounded-full blur-xl" />
          </div>

          {/* Card 2: Pro Users */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md transition-all hover:shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Pro Users
              </span>
              <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              {metricsLoading ? (
                <div className="h-8 w-16 bg-shimmer animate-pulse rounded" />
              ) : (
                <>
                  <span className="font-display font-extrabold text-3xl text-text-primary">
                    {metrics?.proUsers}
                  </span>
                  <span className="text-xs font-bold text-success bg-success/15 px-1.5 py-0.5 rounded">
                    {metrics && metrics.totalUsers > 0 
                      ? Math.round((metrics.proUsers / metrics.totalUsers) * 100) 
                      : 0}%
                  </span>
                </>
              )}
            </div>
            <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-success/5 rounded-full blur-xl" />
          </div>

          {/* Card 3: Brand Profiles */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md transition-all hover:shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Brand Profiles
              </span>
              <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <Sliders className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              {metricsLoading ? (
                <div className="h-8 w-16 bg-shimmer animate-pulse rounded" />
              ) : (
                <span className="font-display font-extrabold text-3xl text-text-primary">
                  {metrics?.totalBrands}
                </span>
              )}
            </div>
            <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-warning/5 rounded-full blur-xl" />
          </div>

          {/* Card 4: Total Generations */}
          <div className="bg-surface/50 border border-border/80 rounded-xl p-6 backdrop-blur-md transition-all hover:shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Total Generations
              </span>
              <div className="h-9 w-9 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              {metricsLoading ? (
                <div className="h-8 w-16 bg-shimmer animate-pulse rounded" />
              ) : (
                <span className="font-display font-extrabold text-3xl text-text-primary">
                  {metrics?.totalGenerations}
                </span>
              )}
            </div>
            <div className="absolute bottom-[-10px] right-[-10px] w-20 h-20 bg-brand-primary/5 rounded-full blur-xl" />
          </div>
        </div>

        {/* Tab Controls */}
        <div className="border-b border-border/80">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`
                pb-4 font-semibold text-sm transition-all focus:outline-none relative cursor-pointer
                ${activeTab === 'users' ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'}
              `}
            >
              User Accounts ({users.length})
              {activeTab === 'users' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('generations')}
              className={`
                pb-4 font-semibold text-sm transition-all focus:outline-none relative cursor-pointer
                ${activeTab === 'generations' ? 'text-brand-primary' : 'text-text-secondary hover:text-text-primary'}
              `}
            >
              System Generations Audit ({generations.length})
              {activeTab === 'generations' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Search & Tables container */}
        <div className="bg-surface/30 border border-border/80 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
          {/* User management tab */}
          {activeTab === 'users' && (
            <div>
              {/* Search Header */}
              <div className="p-4 border-b border-border/80 bg-surface/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search users by email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 bg-background/50 border border-border/80 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  {userSearch && (
                    <button 
                      onClick={() => setUserSearch('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchUsers}
                  disabled={usersLoading}
                  className="h-10 px-4 border border-border rounded-lg bg-surface/50 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {usersLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Reload
                </button>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                {usersLoading && users.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                    <span className="text-sm font-semibold text-text-secondary">Loading registered accounts...</span>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-text-muted text-sm font-medium">
                    No users matching search query.
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface/50 text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-border/60">
                        <th className="px-6 py-4 text-left">Email Identity</th>
                        <th className="px-6 py-4 text-center">Subscription Tier</th>
                        <th className="px-6 py-4 text-center">System Role</th>
                        <th className="px-6 py-4 text-center">Brand Profiles</th>
                        <th className="px-6 py-4 text-center">Total Runs</th>
                        <th className="px-6 py-4 text-left">Signed Up</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {filteredUsers.map((userStat) => {
                        const isSelf = userStat.id === currentUserId;
                        const loadingPro = actionLoadingId === userStat.id + '-pro';
                        const loadingAdmin = actionLoadingId === userStat.id + '-admin';
                        const isConfirmingDelete = deleteConfirmId === userStat.id;
                        
                        return (
                          <tr key={userStat.id} className="hover:bg-surface/20 transition-colors">
                            {/* Email */}
                            <td className="px-6 py-4 font-semibold text-text-primary">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-xs font-bold text-brand-primary">
                                  {userStat.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span>{userStat.email}</span>
                                  {isSelf && (
                                    <span className="text-[10px] text-brand-primary font-bold">You (Active)</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* Pro Badge */}
                            <td className="px-6 py-4 text-center">
                              {userStat.is_pro ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                                  <Zap className="h-3 w-3 fill-success" /> Pro
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-text-secondary/10 text-text-secondary text-xs font-semibold border border-border/60">
                                  Free
                                </span>
                              )}
                            </td>
                            {/* Role Badge */}
                            <td className="px-6 py-4 text-center">
                              {userStat.is_admin ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold border border-brand-primary/20">
                                  <Shield className="h-3 w-3" /> Admin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-text-muted/10 text-text-muted text-xs font-medium border border-border/40">
                                  User
                                </span>
                              )}
                            </td>
                            {/* Brand Profiles count */}
                            <td className="px-6 py-4 text-center font-semibold text-text-primary">
                              {userStat.profiles_count}
                            </td>
                            {/* Generations count */}
                            <td className="px-6 py-4 text-center font-mono font-bold text-text-primary">
                              {userStat.generations_count}
                            </td>
                            {/* Created Date */}
                            <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                              {formatDate(userStat.created_at)}
                            </td>
                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                              {isConfirmingDelete ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-xs font-bold text-danger animate-pulse">Confirm?</span>
                                  <button
                                    onClick={() => handleDeleteUser(userStat.id)}
                                    className="p-1.5 rounded-lg bg-danger/10 hover:bg-danger/25 text-danger transition-colors cursor-pointer"
                                    title="Yes, Delete User"
                                  >
                                    <UserX className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="p-1.5 rounded-lg bg-surface hover:bg-border text-text-secondary transition-colors cursor-pointer border border-border"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  {/* Toggle Pro */}
                                  <button
                                    onClick={() => handleTogglePro(userStat.id, userStat.is_pro)}
                                    disabled={loadingPro || loadingAdmin}
                                    className={`
                                      p-1.5 rounded-lg border border-border text-xs font-semibold cursor-pointer transition-all flex items-center justify-center
                                      ${userStat.is_pro 
                                        ? 'bg-success/5 hover:bg-success/15 text-success border-success/35' 
                                        : 'bg-surface hover:bg-border text-text-secondary'
                                      }
                                    `}
                                    title={userStat.is_pro ? "Downgrade User to Free" : "Upgrade User to Pro"}
                                  >
                                    {loadingPro ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Zap className={`h-3.5 w-3.5 ${userStat.is_pro ? 'fill-success' : ''}`} />
                                    )}
                                  </button>

                                  {/* Toggle Admin */}
                                  <button
                                    onClick={() => handleToggleAdmin(userStat.id, userStat.is_admin)}
                                    disabled={isSelf || loadingAdmin || loadingPro}
                                    className={`
                                      p-1.5 rounded-lg border border-border cursor-pointer transition-all flex items-center justify-center disabled:opacity-40
                                      ${userStat.is_admin 
                                        ? 'bg-brand-primary/5 hover:bg-brand-primary/15 text-brand-primary border-brand-primary/30' 
                                        : 'bg-surface hover:bg-border text-text-muted hover:text-text-secondary'
                                      }
                                    `}
                                    title={isSelf ? "Self Protection Active" : userStat.is_admin ? "Demote Admin" : "Promote to Admin"}
                                  >
                                    {loadingAdmin ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Shield className="h-3.5 w-3.5" />
                                    )}
                                  </button>

                                  {/* Delete user */}
                                  <button
                                    onClick={() => setDeleteConfirmId(userStat.id)}
                                    disabled={isSelf || loadingAdmin || loadingPro}
                                    className="p-1.5 rounded-lg bg-surface hover:bg-danger/10 text-text-muted hover:text-danger border border-border hover:border-danger/30 transition-all cursor-pointer disabled:opacity-40"
                                    title={isSelf ? "Self Protection Active" : "Delete User Account"}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Generations tab */}
          {activeTab === 'generations' && (
            <div>
              {/* Search Header */}
              <div className="p-4 border-b border-border/80 bg-surface/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search logs by email, brand name, type..."
                    value={genSearch}
                    onChange={(e) => setGenSearch(e.target.value)}
                    className="w-full pl-9 pr-4 h-10 bg-background/50 border border-border/80 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-primary transition-colors"
                  />
                  {genSearch && (
                    <button 
                      onClick={() => setGenSearch('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={fetchGenerations}
                  disabled={generationsLoading}
                  className="h-10 px-4 border border-border rounded-lg bg-surface/50 text-xs font-semibold text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generationsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Reload Logs
                </button>
              </div>

              {/* Generations Table */}
              <div className="overflow-x-auto">
                {generationsLoading && generations.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 text-brand-primary animate-spin" />
                    <span className="text-sm font-semibold text-text-secondary">Loading system execution logs...</span>
                  </div>
                ) : filteredGenerations.length === 0 ? (
                  <div className="p-12 text-center text-text-muted text-sm font-medium">
                    No generation records matching query.
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface/50 text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-border/60">
                        <th className="px-6 py-4 text-left">Execution Date</th>
                        <th className="px-6 py-4 text-left">User Email</th>
                        <th className="px-6 py-4 text-left">Brand Settings Name</th>
                        <th className="px-6 py-4 text-left">Generated Content Type</th>
                        <th className="px-6 py-4 text-left">Prompt Summary</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                      {filteredGenerations.map((gen) => (
                        <tr key={gen.id} className="hover:bg-surface/20 transition-colors">
                          {/* Date */}
                          <td className="px-6 py-4 text-text-secondary whitespace-nowrap">
                            {formatDate(gen.created_at)}
                          </td>
                          {/* User */}
                          <td className="px-6 py-4 font-semibold text-text-primary truncate max-w-[180px]">
                            {gen.user_email || 'anonymous-user'}
                          </td>
                          {/* Brand Name */}
                          <td className="px-6 py-4 text-text-secondary">
                            <span className="font-semibold text-text-primary bg-background border border-border px-2 py-1 rounded text-xs">
                              {gen.brand_name || 'N/A'}
                            </span>
                          </td>
                          {/* Content Type */}
                          <td className="px-6 py-4 capitalize">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded border border-brand-primary/15">
                              {gen.content_type}
                            </span>
                          </td>
                          {/* Prompt summary */}
                          <td className="px-6 py-4 text-text-secondary max-w-xs truncate italic">
                            "{gen.prompt_used}"
                          </td>
                          {/* View button */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedGen(gen)}
                              className="px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              Inspect Output <ChevronRight className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* INSPECT MODAL */}
      {selectedGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface border border-border/80 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-left animate-slideUp">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                  Audit logs / ID: {selectedGen.id.substring(0, 8)}
                </span>
                <h3 className="font-display font-extrabold text-xl text-text-primary mt-1">
                  Inspect Generation Run
                </h3>
              </div>
              <button
                onClick={() => setSelectedGen(null)}
                className="text-text-muted hover:text-text-primary p-2 hover:bg-background rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-background/50 border border-border rounded-xl text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">User</span>
                  <span className="font-semibold text-text-primary truncate block mt-0.5">{selectedGen.user_email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Brand profile</span>
                  <span className="font-semibold text-text-primary truncate block mt-0.5">{selectedGen.brand_name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Type</span>
                  <span className="font-mono font-bold text-brand-primary uppercase block mt-0.5">{selectedGen.content_type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-text-muted uppercase block">Date & Time</span>
                  <span className="font-semibold text-text-secondary block mt-0.5">
                    {new Date(selectedGen.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Prompt used */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Prompt Instructions
                </h4>
                <div className="p-4 bg-background/30 border border-border/80 rounded-xl text-sm leading-relaxed text-text-primary font-mono whitespace-pre-wrap max-h-[150px] overflow-y-auto">
                  {selectedGen.prompt_used}
                </div>
              </div>

              {/* Output variants */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Generated Output (AI Compiler)
                </h4>
                <div className="p-4 bg-background border border-border rounded-xl text-sm leading-relaxed text-text-primary whitespace-pre-wrap font-mono min-h-[150px] max-h-[300px] overflow-y-auto relative">
                  {selectedGen.output}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border/80 bg-surface/50 flex justify-end">
              <button
                onClick={() => setSelectedGen(null)}
                className="px-5 h-11 bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-md shadow-brand-primary/10"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
