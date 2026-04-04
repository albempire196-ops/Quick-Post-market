-- Add social links to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS website TEXT;

-- Update public view to include social links
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id, full_name, avatar_url, created_at, updated_at,
  facebook, instagram, linkedin, tiktok, twitter, website
FROM public.profiles;

-- Grant select on new columns to anon/authenticated
GRANT SELECT (facebook, instagram, linkedin, tiktok, twitter, website) ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.profiles_public TO anon, authenticated;
