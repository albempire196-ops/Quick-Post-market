
-- Allow conversation participants to see each other's basic profile info
-- Replace the restrictive own-profile-only policy with one that also allows conversation participants
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Users can view their own full profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
      AND (c.buyer_id = profiles.id OR c.seller_id = profiles.id)
    )
  );
