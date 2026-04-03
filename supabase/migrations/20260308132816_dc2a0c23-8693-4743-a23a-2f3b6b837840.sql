ALTER TABLE public.profiles 
ADD COLUMN preferred_language text DEFAULT 'en',
ADD COLUMN preferred_country text DEFAULT null;