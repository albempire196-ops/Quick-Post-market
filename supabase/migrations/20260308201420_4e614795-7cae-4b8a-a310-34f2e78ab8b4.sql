
CREATE OR REPLACE FUNCTION public.get_product_contact(p_product_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.contact
  FROM public.products p
  WHERE p.id = p_product_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.product_id = p_product_id
        AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    );
$$;
