-- Allow authenticated users to find companions by phone (limited fields via RPC).

CREATE OR REPLACE FUNCTION public.search_profiles_by_phone(p_digits TEXT)
RETURNS TABLE (id UUID, display_name TEXT, phone TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name, p.phone
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND p.id != auth.uid()
    AND p.phone IS NOT NULL
    AND regexp_replace(p.phone, '\D', '', 'g') LIKE ('%' || regexp_replace(p_digits, '\D', '', 'g') || '%')
  LIMIT 5;
$$;

GRANT EXECUTE ON FUNCTION public.search_profiles_by_phone TO authenticated;
