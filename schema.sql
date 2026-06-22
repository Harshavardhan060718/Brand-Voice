-- ==========================================
-- Database Schema for BrandVoice SaaS
-- ==========================================

-- 1. Public Profiles Table (mirrors auth.users with subscription metadata)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    is_pro BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile metadata" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Trigger to automatically create a profile record when a user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, is_pro)
    VALUES (new.id, new.email, FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Brand Profiles Table
CREATE TABLE public.brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    tone TEXT NOT NULL,
    audience TEXT NOT NULL,
    product_desc TEXT NOT NULL,
    avoid_words TEXT, -- Comma-separated list
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Brand Profiles
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand profiles" 
    ON public.brand_profiles FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profiles" 
    ON public.brand_profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profiles" 
    ON public.brand_profiles FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand profiles" 
    ON public.brand_profiles FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. Generations Table (History Archive)
CREATE TABLE public.generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
    content_type VARCHAR(100) NOT NULL,
    prompt_used TEXT NOT NULL,
    output TEXT NOT NULL, -- Stored as text block or JSON array of variants
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations" 
    ON public.generations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations" 
    ON public.generations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" 
    ON public.generations FOR DELETE 
    USING (auth.uid() = user_id);


-- 4. Usage Table (Limits Counter per Month)
CREATE TABLE public.usage (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0),
    PRIMARY KEY (user_id, month)
);

-- Enable RLS on Usage
ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage" 
    ON public.usage FOR SELECT 
    USING (auth.uid() = user_id);

-- Note: Modifying usage is handled via service-role server requests, so client INSERT/UPDATE policies are omitted.
