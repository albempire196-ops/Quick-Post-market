-- Add email to public profile view
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT
  id,
  full_name,
  avatar_url,
  created_at,
  updated_at,
  facebook,
  instagram,
  linkedin,
  tiktok,
  twitter,
  website,
  email
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;
