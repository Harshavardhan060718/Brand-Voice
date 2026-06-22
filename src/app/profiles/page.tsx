'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle,
  Loader2, 
  Sparkles,
  Layers,
  X
} from 'lucide-react';

interface BrandProfile {
  id: string;
  name: string;
  tone: string;
  audience: string;
  product_desc: string;
  avoid_words: string;
  created_at: string;
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BrandProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [tone, setTone] = useState('');
  const [audience, setAudience] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [avoidInput, setAvoidInput] = useState('');
  const [avoidWords, setAvoidWords] = useState<string[]>([]);

  // Fetch Saved Profiles
  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles(selectId?: string) {
    try {
      setLoading(true);
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
        
        // Auto-select profile if requested or choose the first one
        if (data.profiles && data.profiles.length > 0) {
          const toSelect = selectId 
            ? data.profiles.find((p: BrandProfile) => p.id === selectId) 
            : data.profiles[0];
          
          if (toSelect) {
            handleSelectProfile(toSelect);
          } else {
            handleNewProfileState();
          }
        } else {
          handleNewProfileState();
        }
      }
    } catch (err) {
      setError('Failed to fetch brand profiles.');
    } finally {
      setLoading(false);
    }
  }

  const handleSelectProfile = (p: BrandProfile) => {
    setActiveProfile(p);
    setName(p.name);
    setTone(p.tone);
    setAudience(p.audience);
    setProductDesc(p.product_desc);
    
    // Parse avoid words
    const parsed = p.avoid_words 
      ? p.avoid_words.split(',').map(w => w.trim()).filter(Boolean) 
      : [];
    setAvoidWords(parsed);
    setAvoidInput('');
    setError(null);
    setSuccess(null);
  };

  const handleNewProfileState = () => {
    setActiveProfile(null);
    setName('');
    setTone('');
    setAudience('');
    setProductDesc('');
    setAvoidWords([]);
    setAvoidInput('');
    setError(null);
    setSuccess(null);
  };

  // Add tag chip on Enter key or comma input
  const handleAvoidKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addAvoidWord();
    }
  };

  const addAvoidWord = () => {
    const word = avoidInput.trim().replace(/,/g, '');
    if (word && !avoidWords.includes(word)) {
      setAvoidWords([...avoidWords, word]);
    }
    setAvoidInput('');
  };

  const removeAvoidWord = (word: string) => {
    setAvoidWords(avoidWords.filter(w => w !== word));
  };

  // Save Form Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaveLoading(true);

    const avoidWordsStr = avoidWords.join(', ');

    const payload = {
      name,
      tone,
      audience,
      product_desc: productDesc,
      avoid_words: avoidWordsStr
    };

    try {
      let res;
      if (activeProfile) {
        // Edit Mode (PUT)
        res = await fetch(`/api/profiles/${activeProfile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create Mode (POST)
        res = await fetch('/api/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();

      if (res.ok) {
        setSuccess(activeProfile ? 'Brand profile updated!' : 'Brand profile created!');
        // Reload list and select updated/new item
        const toSelectId = activeProfile ? activeProfile.id : data.profile.id;
        await fetchProfiles(toSelectId);
      } else {
        setError(data.error || 'Failed to save brand profile.');
      }
    } catch (err) {
      setError('A connection error occurred.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    setError(null);
    setSuccess(null);
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/profiles/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Brand profile deleted.');
        setShowDeleteModal(null);
        await fetchProfiles();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete brand profile.');
      }
    } catch (err) {
      setError('Connection error on delete request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 items-start relative h-full">
        {/* Left Column - Master List */}
        <div className="w-full lg:w-[320px] bg-surface/50 border border-border/80 rounded-xl p-4 flex flex-col gap-4 max-h-[calc(100vh-140px)] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-1.5 text-text-primary">
              <Layers className="h-4 w-4 text-brand-primary" />
              <span className="font-display font-bold text-sm">Your Brands</span>
            </div>
            <span className="text-[10px] bg-surface border border-border text-text-secondary px-2 py-0.5 rounded-full font-mono">
              {profiles.length}/5
            </span>
          </div>

          <button
            onClick={handleNewProfileState}
            className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold shadow-lg shadow-brand-primary/15 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Brand Profile
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-text-secondary">
              <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
              <span className="text-xs">Loading profiles...</span>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12 text-text-secondary border-2 border-dashed border-border/40 rounded-xl">
              <Sparkles className="h-8 w-8 text-brand-primary/40 mx-auto mb-2" />
              <p className="text-xs font-semibold">No profiles found</p>
              <p className="text-[10px] text-text-muted mt-1 px-4">Create your first brand profile guidelines to begin generating copy.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {profiles.map((p) => {
                const active = activeProfile?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProfile(p)}
                    className={`
                      group p-3 rounded-lg border text-left cursor-pointer transition-all flex justify-between items-center
                      ${active 
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-md shadow-brand-primary/5' 
                        : 'bg-background/40 border-border hover:bg-surface/70 text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-semibold truncate text-text-primary group-hover:text-brand-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-text-muted truncate mt-0.5">
                        {p.tone}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal(p.id);
                      }}
                      className="text-text-muted hover:text-danger hover:bg-danger/10 p-1.5 rounded-lg transition-colors focus:outline-none opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete profile"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column - Editor Panel */}
        <div className="flex-1 w-full bg-surface/50 border border-border/80 rounded-xl p-6 md:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">
                {activeProfile ? `Modify Guidelines: ${activeProfile.name}` : 'New Brand Guidelines'}
              </h2>
              <p className="text-xs text-text-secondary mt-1">
                Define the guidelines that AI will use to match your content's voice.
              </p>
            </div>
            {activeProfile && (
              <button
                onClick={handleNewProfileState}
                className="text-xs font-semibold text-brand-primary hover:text-brand-hover"
              >
                Create New Profile
              </button>
            )}
          </div>

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

          <form className="space-y-6 text-left" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                  Brand / Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                  placeholder="e.g. Nike, FitFlex, Starbucks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                  Tone of Voice
                </label>
                <input
                  type="text"
                  required
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="block w-full h-11 px-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm"
                  placeholder="e.g. Bold, Motivational, Casual, Scientific"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                Target Audience Demographics
              </label>
              <textarea
                required
                rows={2}
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="block w-full p-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm resize-none"
                placeholder="e.g. Young athletes, remote developers looking to simplify home cooking..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                Core Product / Service Description
              </label>
              <textarea
                required
                rows={4}
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                className="block w-full p-4 rounded-lg border border-border bg-background/50 text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm resize-none"
                placeholder="Describe your product value points, features, and target benefits so the generator knows what selling points to highlight."
              />
            </div>

            {/* Avoid Words Chip Editor */}
            <div>
              <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-2">
                Words / Phrases to Avoid
              </label>
              <div className="flex flex-wrap gap-2 p-2 min-h-[44px] rounded-lg border border-border bg-background/50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/10 transition-all">
                {avoidWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-danger/10 border border-danger/25 text-danger font-mono text-xs"
                  >
                    {word}
                    <button
                      type="button"
                      onClick={() => removeAvoidWord(word)}
                      className="text-danger/60 hover:text-danger focus:outline-none cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  onKeyDown={handleAvoidKeyDown}
                  onBlur={addAvoidWord}
                  className="flex-1 min-w-[120px] bg-transparent border-none text-text-primary placeholder-text-muted focus:outline-none text-sm px-2 py-1"
                  placeholder="Press enter or comma to tag words to avoid"
                />
              </div>
              <span className="text-[10px] text-text-muted mt-1 block">Prevent the generator from using trademarked terms, or marketing fluff like "bargain", "cheap", or "game-changer".</span>
            </div>

            <div className="border-t border-border/60 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saveLoading}
                className="h-11 px-6 flex items-center justify-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-sm font-semibold shadow-lg shadow-brand-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {saveLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {activeProfile ? 'Save Changes' : 'Create Profile'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-surface border border-border/80 shadow-2xl rounded-xl p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-text-primary">Delete Brand Guidelines?</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Are you sure you want to delete this profile? This will permanently erase this profile and all historical content generated using it. This action is irreversible.
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
