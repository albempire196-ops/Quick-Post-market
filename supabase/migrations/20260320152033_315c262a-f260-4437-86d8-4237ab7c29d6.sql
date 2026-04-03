
DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
SELECT id, user_id, title, description, price, category, country, image_url, media_urls, created_at, updated_at
FROM public.products;
GRANT SELECT ON public.products_public TO anon, authenticated;
