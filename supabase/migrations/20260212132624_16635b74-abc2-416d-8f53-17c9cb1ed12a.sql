
CREATE POLICY "Conversation participants can update conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
