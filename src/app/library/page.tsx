'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FolderHeart, 
  Search, 
  Trash2, 
  Clipboard, 
  Check, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sliders,
  Type,
  AlertTriangle
} from 'lucide-react';

interface BrandProfile {
  id: string;
  name: string;
  tone: string;
}

interface GenerationLog {
  id: string;
  contentType: string;
  promptUsed: string;
  output: string;
  createdAt: string;
  brandName: string;
  profileId: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

const CONTENT_TYPES = [
  'Instagram Caption',
  'Facebook Post',
  'LinkedIn Post',
  'Ad Headline',
  'Product Description',
  'Cold Email',
  'Marketing Copy'
];

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

export default function LibraryPage() {
  const [generations, setGenerations] = useState<GenerationLog[]>([]);
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch profiles on mount to populate search filter
  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/profiles');
        if (res.ok) {
          const data = await res.json();
          setProfiles(data.profiles || []);
        }
      } catch (err) {
        console.error('Failed to load profiles in library', err);
      }
    }
    loadProfiles();
  }, []);

  // Fetch paginated generation logs on filter or page change
  useEffect(() => {
    fetchGenerations();
  }, [page, selectedProfileId, selectedContentType]);

  async function fetchGenerations() {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/generations?page=${page}&limit=10`;
      if (selectedProfileId) url += `&profileId=${selectedProfileId}`;
      if (selectedContentType) url += `&contentType=${selectedContentType}`;

      const res = await fetch(url);
      const data = await res.json();

      if (res.ok) {
        setGenerations(data.generations || []);
        setPagination(data.pagination);
      } else {
        setError(data.error || 'Failed to fetch content library.');
      }
    } catch (err) {
      setError('A connection error occurred.');
    } finally {
      setLoading(false);
    }
  }

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setShowDeleteModal(null);
        // If current page empty after delete, go back one page if possible
        if (generations.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          await fetchGenerations();
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete record.');
      }
    } catch (err) {
      setError('Connection error occurred.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedProfileId('');
    setSelectedContentType('');
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 text-left">
        {/* Page Titles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
              Content Library
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Search and retrieve your historical AI generated content pieces.
            </p>
          </div>
          
          <Link
            href="/generate"
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-lg shadow-brand-primary/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            Create New Content <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter Toolbar Cards */}
        <div className="bg-surface/50 border border-border/80 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 backdrop-blur-md">
          {/* Brand Filter */}
          <div className="w-full md:w-auto flex-1">
            <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sliders className="h-3 w-3 text-text-muted" /> Filter by Brand
            </label>
            <select
              value={selectedProfileId}
              onChange={(e) => {
                setSelectedProfileId(e.target.value);
                setPage(1);
              }}
              className="block w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-text-primary text-xs focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="">All Brands</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type Filter */}
          <div className="w-full md:w-auto flex-1">
            <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Type className="h-3 w-3 text-text-muted" /> Filter by Template
            </label>
            <select
              value={selectedContentType}
              onChange={(e) => {
                setSelectedContentType(e.target.value);
                setPage(1);
              }}
              className="block w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-text-primary text-xs focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="">All templates</option>
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(selectedProfileId || selectedContentType) && (
            <button
              onClick={handleClearFilters}
              className="w-full md:w-auto h-10 px-4 rounded-lg border border-border bg-surface/50 text-text-secondary hover:text-text-primary text-xs font-semibold mt-5 md:mt-0 cursor-pointer transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-danger/10 border border-danger/25 text-danger text-sm">
            {error}
          </div>
        )}

        {/* Content History List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-secondary">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            <span className="text-xs">Searching database logs...</span>
          </div>
        ) : generations.length === 0 ? (
          <div className="bg-surface/50 border border-border/80 rounded-xl p-16 text-center space-y-4 backdrop-blur-md">
            <FolderHeart className="h-12 w-12 text-brand-primary/30 mx-auto mb-2" />
            <h3 className="font-display font-bold text-lg text-text-primary">No records found</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              No historic logs found matching the selected filters. Change search parameters or generate new content.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generations.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface/50 border border-border/80 rounded-xl p-5 hover:border-brand-primary/40 transition-colors flex flex-col justify-between gap-4 text-left relative group animate-fade-in"
                >
                  <div className="space-y-3">
                    {/* Header: Template badge and Date */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-brand-primary font-semibold text-[9px] tracking-wide uppercase font-mono">
                          {item.contentType}
                        </span>
                        <span className="text-[10px] text-text-secondary font-display font-semibold">
                          Brand: <span className="text-text-primary">{item.brandName}</span>
                        </span>
                      </div>
                      
                      {/* Control Operations */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyToClipboard(item.output, item.id)}
                          className="text-text-muted hover:text-text-primary hover:bg-surface/50 p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Clipboard className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(item.id)}
                          className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors focus:outline-none cursor-pointer"
                          title="Delete generation log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Prompt instructions text */}
                    {(() => {
                      const parsed = parsePrompt(item.promptUsed);
                      return (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">Input Prompt</span>
                            <p className="text-xs text-text-secondary italic mt-1 bg-background/30 p-2 border border-border/40 rounded-md">
                              "{parsed.instruction}"
                            </p>
                          </div>
                          {parsed.examples && (
                            <div>
                              <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">Style Reference Examples</span>
                              <p className="text-[11px] text-text-muted italic mt-1 bg-background/20 p-2 border border-border/40 rounded-md max-h-24 overflow-y-auto whitespace-pre-wrap">
                                {parsed.examples}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Output result content */}
                    <div>
                      <span className="text-[9px] font-semibold text-text-muted uppercase tracking-wider block">Generated Copy</span>
                      <div className="p-3 bg-background/50 border border-border rounded-lg text-xs leading-relaxed text-text-primary whitespace-pre-wrap mt-1 select-text">
                        {item.output}
                      </div>
                    </div>
                  </div>

                  {/* Actions footer (Reuse parameters button) */}
                  <div className="border-t border-border/60 pt-3 flex justify-between items-center text-[10px] text-text-muted">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    <Link
                      href={`/generate?profileId=${item.profileId}&contentType=${encodeURIComponent(item.contentType)}&promptUsed=${encodeURIComponent(item.promptUsed)}`}
                      className="text-brand-primary hover:text-brand-hover font-semibold flex items-center gap-0.5 transition-colors"
                    >
                      Reuse Parameters &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls bar */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <span className="text-xs text-text-secondary">
                  Showing page {page} of {pagination.totalPages} ({pagination.totalItems} entries)
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="h-9 w-9 rounded-lg border border-border hover:bg-surface/50 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                    disabled={page === pagination.totalPages}
                    className="h-9 w-9 rounded-lg border border-border hover:bg-surface/50 text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Alert Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface border border-border/80 shadow-2xl rounded-xl p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">Delete Generation Record?</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Are you sure you want to delete this generation log from your history? 
                *Note: This will not credit or decrease your monthly generation tally.*
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deleteLoading}
                className="flex-1 h-10 rounded-lg border border-border text-text-secondary hover:text-text-primary text-xs font-semibold focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleteLoading}
                className="flex-1 h-10 rounded-lg bg-danger hover:bg-danger/90 text-white text-xs font-semibold focus:outline-none flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Yes, Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
