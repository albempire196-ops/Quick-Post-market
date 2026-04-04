ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

UPDATE public.profiles
SET is_admin = true
WHERE email = 'albempire196@gmail.com';

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';

ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_status_check;

ALTER TABLE public.products
ADD CONSTRAINT products_status_check
CHECK (status IN ('available', 'reserved', 'sold'));

DROP VIEW IF EXISTS public.products_public;
CREATE VIEW public.products_public AS
SELECT id, user_id, title, description, price, category, country, image_url, media_urls, status, created_at, updated_at
FROM public.products;
GRANT SELECT ON public.products_public TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorites;
CREATE POLICY "Users can view own favorites"
ON public.favorites FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own favorites" ON public.favorites;
CREATE POLICY "Users can create own favorites"
ON public.favorites FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;
CREATE POLICY "Users can delete own favorites"
ON public.favorites FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.product_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_reports_status_check CHECK (status IN ('open', 'reviewed', 'resolved'))
);

ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create own product reports" ON public.product_reports;
CREATE POLICY "Users can create own product reports"
ON public.product_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own product reports" ON public.product_reports;
CREATE POLICY "Users can view own product reports"
ON public.product_reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins can view all product reports" ON public.product_reports;
CREATE POLICY "Admins can view all product reports"
ON public.product_reports FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update product reports" ON public.product_reports;
CREATE POLICY "Admins can update product reports"
ON public.product_reports FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update any product" ON public.products;
CREATE POLICY "Admins can update any product"
ON public.products FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any product" ON public.products;
CREATE POLICY "Admins can delete any product"
ON public.products FOR DELETE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete any product media" ON storage.objects;
CREATE POLICY "Admins can delete any product media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-media' AND public.is_admin());

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_product_id_idx ON public.favorites(product_id);
CREATE INDEX IF NOT EXISTS product_reports_product_id_idx ON public.product_reports(product_id);
CREATE INDEX IF NOT EXISTS product_reports_status_idx ON public.product_reports(status);