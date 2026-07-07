-- User Story 10: profile fields for signup + phone duplicate check + login lookup.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS phone_country_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON public.profiles (phone)
  WHERE phone IS NOT NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_first TEXT;
  v_last TEXT;
  v_phone TEXT;
  v_country TEXT;
  v_cc TEXT;
  v_email TEXT;
BEGIN
  v_first := NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), '');
  v_last := NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '');
  v_country := NULLIF(TRIM(NEW.raw_user_meta_data->>'country'), '');
  v_cc := NULLIF(TRIM(NEW.raw_user_meta_data->>'phone_country_code'), '');
  v_phone := COALESCE(
    NULLIF(TRIM(NEW.phone), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), '')
  );
  v_email := COALESCE(NULLIF(TRIM(NEW.email), ''), NULLIF(TRIM(NEW.raw_user_meta_data->>'email'), ''));

  INSERT INTO public.profiles (
    id, phone, email, first_name, last_name, country, phone_country_code, display_name
  )
  VALUES (
    NEW.id,
    v_phone,
    v_email,
    v_first,
    v_last,
    v_country,
    v_cc,
    NULLIF(TRIM(CONCAT(v_first, ' ', v_last)), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    first_name = COALESCE(EXCLUDED.first_name, public.profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.profiles.last_name),
    country = COALESCE(EXCLUDED.country, public.profiles.country),
    phone_country_code = COALESCE(EXCLUDED.phone_country_code, public.profiles.phone_country_code),
    display_name = COALESCE(
      EXCLUDED.display_name,
      NULLIF(TRIM(CONCAT(
        COALESCE(EXCLUDED.first_name, public.profiles.first_name, ''),
        ' ',
        COALESCE(EXCLUDED.last_name, public.profiles.last_name, '')
      )), ''),
      public.profiles.display_name
    );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_phone_registered(p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.phone IS NOT NULL
      AND regexp_replace(p.phone, '\D', '', 'g')
        = regexp_replace(p_phone, '\D', '', 'g')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_login_email_by_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE p.phone IS NOT NULL
    AND regexp_replace(p.phone, '\D', '', 'g')
      = regexp_replace(p_phone, '\D', '', 'g')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_registered TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_login_email_by_phone TO authenticated, anon;
