-- ========================================================
-- BrandVoice Database Migration: Admin Login & Dashboard
-- Run these commands in your Supabase SQL Editor
-- ========================================================

-- 1. Add is_admin column to public.profiles if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Update public.handle_new_user trigger function to include is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_pro, is_admin)
    VALUES (new.id, new.email, FALSE, FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create or replace view for admin user statistics
-- This combines profiles, brand profile count, and generations count.
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT 
    p.id,
    p.email,
    p.is_pro,
    p.is_admin,
    p.created_at,
    COALESCE(bp.count, 0) as profiles_count,
    COALESCE(g.count, 0) as generations_count
FROM public.profiles p
LEFT JOIN (
    SELECT user_id, COUNT(*) as count FROM public.brand_profiles GROUP BY user_id
) bp ON p.id = bp.user_id
LEFT JOIN (
    SELECT user_id, COUNT(*) as count FROM public.generations GROUP BY user_id
) g ON p.id = g.user_id;

-- 4. Create or replace view for admin generations log
-- This joins generations with profile emails and brand names.
CREATE OR REPLACE VIEW public.admin_generations_log AS
SELECT 
    g.id,
    g.content_type,
    g.prompt_used,
    g.output,
    g.created_at,
    g.user_id,
    p.email as user_email,
    bp.name as brand_name
FROM public.generations g
LEFT JOIN public.profiles p ON g.user_id = p.id
LEFT JOIN public.brand_profiles bp ON g.profile_id = bp.id;

-- ========================================================
-- Seed SQL (Uncomment and run with your email to make yourself admin)
-- ========================================================
-- UPDATE public.profiles SET is_admin = true WHERE email = 'your-email@example.com';


-- ========================================================
-- AI Feedback & Personalization Loop Table
-- Run these commands in your Supabase SQL Editor
-- ========================================================

CREATE TABLE IF NOT EXISTS public.generation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    generation_id UUID NOT NULL REFERENCES public.generations(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.generation_feedback ENABLE ROW LEVEL SECURITY;

-- Select policy (users can view their own feedback)
CREATE POLICY "Users can view their own feedback" 
    ON public.generation_feedback FOR SELECT 
    USING (auth.uid() = user_id);

-- Insert policy (users can insert their own feedback)
CREATE POLICY "Users can insert their own feedback" 
    ON public.generation_feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
