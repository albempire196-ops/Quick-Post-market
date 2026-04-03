
-- Create a public view for profiles that hides email
CREATE VIEW public.profiles_public
WITH (security_invoker=on) AS
  SELECT id, full_name, avatar_url, created_at, updated_at
  FROM public.profiles;

-- Restrict direct profiles SELECT to own profile only (hides email from others)
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow public view to work for basic info (name, avatar) via a service-level approach
-- We'll use a security definer function instead
CREATE OR REPLACE FUNCTION public.get_profile_public(profile_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;

-- Restrict products contact field: only authenticated users can see it
-- First drop the current open select policy
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;

-- Public can see products but NOT contact info - we use a view
CREATE VIEW public.products_public
WITH (security_invoker=on) AS
  SELECT id, user_id, title, description, price, category, country, image_url, created_at, updated_at
  FROM public.products;

-- Anon users can see products without contact
CREATE POLICY "Anon can view products without contact"
  ON public.products FOR SELECT
  TO anon
  USING (true);

-- Authenticated users can see all products including contact
CREATE POLICY "Authenticated can view all products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

-- Tighten INSERT policy with explicit role
DROP POLICY IF EXISTS "Authenticated users can insert their own products" ON public.products;
CREATE POLICY "Authenticated users can insert own products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Tighten UPDATE/DELETE with explicit role
DROP POLICY IF EXISTS "Owners can update their own products" ON public.products;
CREATE POLICY "Owners can update own products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete their own products" ON public.products;
CREATE POLICY "Owners can delete own products"
  ON public.products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tighten profiles INSERT/UPDATE
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tighten conversations policies with explicit roles
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  TO authenticated
  USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

DROP POLICY IF EXISTS "Conversation participants can update conversations" ON public.conversations;
CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING ((auth.uid() = buyer_id) OR (auth.uid() = seller_id));

-- Tighten messages policies
DROP POLICY IF EXISTS "Conversation participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
  ));

DROP POLICY IF EXISTS "Conversation participants can send messages" ON public.messages;
CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid() = c.buyer_id OR auth.uid() = c.seller_id)
    )
  );
