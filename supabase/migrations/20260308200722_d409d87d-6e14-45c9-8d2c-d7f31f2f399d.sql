
-- Recreate products_public view WITHOUT security_invoker so it bypasses RLS
-- This is safe because the view itself excludes the contact column
DROP VIEW IF EXISTS public.products_public;

CREATE VIEW public.products_public AS
  SELECT id, user_id, title, description, price, category, country, image_url, created_at, updated_at
  FROM public.products;

-- Grant SELECT on the view to anon and authenticated
GRANT SELECT ON public.products_public TO anon, authenticated;

-- Also recreate profiles_public as security definer (no email exposed)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT id, full_name, avatar_url, created_at, updated_at
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
