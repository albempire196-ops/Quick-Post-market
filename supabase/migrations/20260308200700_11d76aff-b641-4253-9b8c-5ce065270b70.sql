
-- 1. Drop the overly permissive anon SELECT policy on products
DROP POLICY IF EXISTS "Anon can view products without contact" ON public.products;

-- 2. Drop the current authenticated SELECT policy
DROP POLICY IF EXISTS "Authenticated can view all products" ON public.products;

-- 3. Create a restrictive SELECT policy: only owners can SELECT from the base table
-- (everyone else uses products_public view which excludes contact)
CREATE POLICY "Only owners can select own products"
ON public.products FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Also allow reading for conversation participants (needed for chat)
CREATE POLICY "Conversation participants can view product"
ON public.products FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.product_id = products.id
    AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
  )
);

-- 5. Allow anon to read products_public view by granting SELECT on it
-- (products_public is security_invoker so it uses the caller's permissions,
--  but since it's a view we need a policy on the base table for anon)
-- Actually, let's create a permissive policy for SELECT on products that excludes contact
-- Better approach: restrict base table and use products_public view

-- 6. Update profiles SELECT policy to not expose email to conversation participants
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- For conversation participants, use the profiles_public view instead (no email)
-- No need for a separate policy - they'll use get_profile_public function
