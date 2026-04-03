-- Change price column from numeric to text to allow letters/words
ALTER TABLE public.products ALTER COLUMN price TYPE text USING price::text;